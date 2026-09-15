import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Droplets, Flame, MoreHorizontal, Pencil, Plus, Salad, Trash2, UtensilsCrossed, Wheat } from "lucide-react";
import { toast } from "sonner";
import { Card, CardTitle, EmptyState, FieldLabel, PageHeader, Skeleton } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  addCategory, addFoodOption, addMeal, addMealItem, deleteCategory, deleteFoodOption,
  deleteMeal, deleteMealItem, fetchMealsData, renameCategory, renameFoodOption, renameMeal,
  reorderCategories, reorderFoodOptions, reorderMealItems, reorderMeals, saveNutritionTarget,
  updateMealItem, type CategoryWithOptions, type FoodOption, type ItemValues,
  type MealPlanItem, type MealWithItems, type NutritionTarget, type TargetValues,
} from "./api";

const QUERY_KEY = ["meals"];
const UNITS = ["g", "kg", "ml", "L", "piece", "pieces", "tbsp", "tsp", "cup", "serving"];
const DEFAULT_TARGET: TargetValues = {
  calories_min: 1550, calories_max: 1650, protein_min_g: 120, protein_max_g: 130,
  carbs_min_g: 120, carbs_max_g: 140, fat_min_g: 40, fat_max_g: 45,
  water_min_l: 2.5, water_max_l: 3,
};

export function MealsPage() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: QUERY_KEY, queryFn: fetchMealsData });
  const data = query.data;
  const refresh = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY });
  const run = async (action: () => Promise<unknown>, success: string) => {
    try { await action(); await refresh(); toast.success(success); }
    catch { toast.error("That change couldn't be saved. Please try again."); throw new Error("save failed"); }
  };

  return (
    <>
      <PageHeader icon={<UtensilsCrossed className="size-7" />} title="Meals" subtitle="Eat well, feel good" />
      <Tabs defaultValue="target" className="space-y-5">
        <TabsList className="grid h-11 w-full grid-cols-3 rounded-xl bg-lavender-faint p-1 sm:max-w-xl">
          <TabsTrigger value="target" className="h-9 px-1 text-[11px] sm:text-sm">Daily Target</TabsTrigger>
          <TabsTrigger value="plan" className="h-9 px-1 text-[11px] sm:text-sm">Meal Plan</TabsTrigger>
          <TabsTrigger value="options" className="h-9 px-1 text-[11px] sm:text-sm">Food Options</TabsTrigger>
        </TabsList>
        {query.isLoading ? <Skeleton className="h-72" /> : query.isError || !data ? (
          <Card><EmptyState title="Meals couldn't load" description="Please refresh and try again." /></Card>
        ) : (
          <>
            <TabsContent value="target" className="mt-0"><DailyTargetSection target={data.target} run={run} /></TabsContent>
            <TabsContent value="plan" className="mt-0"><MealPlanSection meals={data.meals} foodNames={data.categories.flatMap((c) => c.options.map((o) => o.name))} run={run} /></TabsContent>
            <TabsContent value="options" className="mt-0"><FoodOptionsSection categories={data.categories} run={run} /></TabsContent>
          </>
        )}
      </Tabs>
    </>
  );
}

const TARGETS = [
  { label: "Calories", min: "calories_min", max: "calories_max", unit: "kcal", icon: Flame },
  { label: "Protein", min: "protein_min_g", max: "protein_max_g", unit: "g", icon: UtensilsCrossed },
  { label: "Carbohydrates", min: "carbs_min_g", max: "carbs_max_g", unit: "g", icon: Wheat },
  { label: "Fat", min: "fat_min_g", max: "fat_max_g", unit: "g", icon: Salad },
  { label: "Water", min: "water_min_l", max: "water_max_l", unit: "L", icon: Droplets },
] as const;

function numberText(value: number) { return Number(value).toLocaleString("en-US", { maximumFractionDigits: 2 }); }

function DailyTargetSection({ target, run }: { target: NutritionTarget | null; run: Runner }) {
  const [editing, setEditing] = useState(false);
  const values = target ?? ({ ...DEFAULT_TARGET, id: "", user_id: "", created_at: "", updated_at: "" } as NutritionTarget);
  return (
    <Card>
      <CardTitle action={<Button variant="soft" size="sm" onClick={() => setEditing(true)}><Pencil /> Edit Targets</Button>}>Daily Target</CardTitle>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {TARGETS.map(({ label, min, max, unit, icon: Icon }) => (
          <div key={label} className="flex min-h-24 items-center gap-3 rounded-xl bg-lavender-faint/60 p-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-lavender-soft text-primary"><Icon className="size-4" /></span>
            <div className="min-w-0"><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-1 whitespace-nowrap text-lg font-bold tabular-nums">{numberText(values[min])} – {numberText(values[max])} <span className="text-xs font-medium text-muted-foreground">{unit}</span></p></div>
          </div>
        ))}
      </div>
      <TargetDialog open={editing} onOpenChange={setEditing} target={target} onSave={(next) => run(() => saveNutritionTarget(target?.id ?? null, next), "Daily targets saved")} />
    </Card>
  );
}

function TargetDialog({ open, onOpenChange, target, onSave }: { open: boolean; onOpenChange: (v: boolean) => void; target: NutritionTarget | null; onSave: (v: TargetValues) => Promise<void> }) {
  const initial = target ?? DEFAULT_TARGET;
  const [form, setForm] = useState<TargetValues>(initial);
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (open) setForm(target ?? DEFAULT_TARGET); }, [open, target]);
  const set = (key: keyof TargetValues, value: string) => setForm((old) => ({ ...old, [key]: Number(value) }));
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (TARGETS.some(({ min, max }) => form[min] < 0 || form[max] < form[min])) { toast.error("Each maximum must be at least its minimum."); return; }
    setSaving(true); try { await onSave(form); onOpenChange(false); } finally { setSaving(false); }
  };
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl"><form onSubmit={submit}><DialogHeader><DialogTitle>Edit Daily Targets</DialogTitle><DialogDescription>These ranges stay the same until you change them.</DialogDescription></DialogHeader><div className="mt-5 space-y-4">{TARGETS.map(({ label, min, max, unit }) => <fieldset key={label}><legend className="mb-2 text-sm font-semibold">{label}</legend><div className="grid grid-cols-[1fr_1fr_auto] items-end gap-2"><div><FieldLabel htmlFor={`${min}-input`}>Minimum</FieldLabel><Input id={`${min}-input`} type="number" min="0" step="any" required value={form[min]} onChange={(e) => set(min, e.target.value)} /></div><div><FieldLabel htmlFor={`${max}-input`}>Maximum</FieldLabel><Input id={`${max}-input`} type="number" min="0" step="any" required value={form[max]} onChange={(e) => set(max, e.target.value)} /></div><span className="pb-3 text-sm font-medium text-muted-foreground">{unit}</span></div></fieldset>)}</div><DialogFooter className="mt-6"><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save Targets"}</Button></DialogFooter></form></DialogContent></Dialog>;
}

type Runner = (action: () => Promise<unknown>, success: string) => Promise<void>;
type NameEditor = { type: "meal" | "category" | "option"; id?: string; parentId?: string; value: string; sortOrder: number };
type DeleteState = { kind: "meal" | "category"; id: string; name: string } | null;

function MealPlanSection({ meals, foodNames, run }: { meals: MealWithItems[]; foodNames: string[]; run: Runner }) {
  const [editing, setEditing] = useState(false);
  return <>
    <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">Meal Plan</h2><Button variant="soft" size="sm" onClick={() => setEditing(true)}><Pencil /> Edit Meal Plan</Button></div>
    {meals.length === 0 ? <Card><EmptyState title="No meals in your plan" action={<Button onClick={() => setEditing(true)}><Plus /> Add Meal</Button>} /></Card> : <div className="grid gap-4 lg:grid-cols-3">{meals.map((meal) => <Card key={meal.id} className="min-h-44"><h3 className="text-xs font-semibold uppercase text-primary">{meal.meal_name}</h3><div className="mt-4 space-y-3">{meal.items.length ? meal.items.map((item) => <p key={item.id} className="text-sm leading-6">{formatFoodItem(item)}</p>) : <p className="text-sm text-muted-foreground">No foods added yet.</p>}</div></Card>)}</div>}
    <MealPlanEditor open={editing} onOpenChange={setEditing} meals={meals} foodNames={foodNames} run={run} />
  </>;
}

function formatFoodItem(item: Pick<MealPlanItem, "quantity" | "unit" | "preparation" | "food_name">) {
  return `${numberText(item.quantity)} ${item.unit}${item.preparation ? ` ${item.preparation}` : ""} ${item.food_name.toLocaleLowerCase()}`;
}

function MealPlanEditor({ open, onOpenChange, meals, foodNames, run }: { open: boolean; onOpenChange: (v: boolean) => void; meals: MealWithItems[]; foodNames: string[]; run: Runner }) {
  const [nameEditor, setNameEditor] = useState<NameEditor | null>(null);
  const [itemEditor, setItemEditor] = useState<{ meal: MealWithItems; item?: MealPlanItem } | null>(null);
  const [deleteState, setDeleteState] = useState<DeleteState>(null);
  const move = (index: number, offset: number) => { const current = meals[index]; const other = meals[index + offset]; if (current && other) void run(() => reorderMeals(current, other), "Meal order updated"); };
  return <><Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl"><DialogHeader><DialogTitle>Edit Meal Plan</DialogTitle><DialogDescription>Keep your current eating structure simple and easy to scan.</DialogDescription></DialogHeader><div className="space-y-4">{meals.map((meal, mealIndex) => <div key={meal.id} className="rounded-xl border border-border bg-card p-4"><div className="flex items-center gap-2"><h3 className="min-w-0 flex-1 truncate font-semibold">{meal.meal_name}</h3><OrderButtons index={mealIndex} total={meals.length} onMove={move} label="meal" /><Button size="iconSm" variant="ghost" aria-label={`Rename ${meal.meal_name}`} onClick={() => setNameEditor({ type: "meal", id: meal.id, value: meal.meal_name, sortOrder: meal.sort_order })}><Pencil /></Button><Button size="iconSm" variant="ghost" aria-label={`Delete ${meal.meal_name}`} onClick={() => setDeleteState({ kind: "meal", id: meal.id, name: meal.meal_name })}><Trash2 /></Button></div><div className="mt-3 space-y-2">{meal.items.map((item, itemIndex) => <div key={item.id} className="flex items-center gap-2 rounded-lg bg-lavender-faint/60 px-3 py-2"><p className="min-w-0 flex-1 text-sm">{formatFoodItem(item)}</p><OrderButtons index={itemIndex} total={meal.items.length} onMove={(i, o) => { const current = meal.items[i]; const other = meal.items[i + o]; if (current && other) void run(() => reorderMealItems(current, other), "Food order updated"); }} label="food" /><Button size="iconSm" variant="ghost" aria-label={`Edit ${item.food_name}`} onClick={() => setItemEditor({ meal, item })}><Pencil /></Button><Button size="iconSm" variant="ghost" aria-label={`Delete ${item.food_name}`} onClick={() => void run(() => deleteMealItem(item.id), "Food removed")}><Trash2 /></Button></div>)}<Button variant="ghost" size="sm" onClick={() => setItemEditor({ meal })}><Plus /> Add Food</Button></div></div>)}</div><DialogFooter className="mt-2"><Button variant="outline" onClick={() => setNameEditor({ type: "meal", value: "", sortOrder: meals.length })}><Plus /> Add Meal</Button><Button onClick={() => onOpenChange(false)}>Done</Button></DialogFooter></DialogContent></Dialog>
    <NameDialog editor={nameEditor} onClose={() => setNameEditor(null)} title={nameEditor?.id ? "Rename Meal" : "Add Meal"} label="Meal name" onSave={async (e) => { if (e.id) await run(() => renameMeal(e.id as string, e.value), "Meal renamed"); else await run(() => addMeal(e.value, e.sortOrder), "Meal added"); }} />
    <FoodItemDialog editor={itemEditor} foodNames={foodNames} onClose={() => setItemEditor(null)} onSave={async (values) => { if (!itemEditor) return; if (itemEditor.item) await run(() => updateMealItem(itemEditor.item?.id ?? "", values), "Food updated"); else await run(() => addMealItem(itemEditor.meal.id, values, itemEditor.meal.items.length), "Food added"); }} />
    <ConfirmDelete state={deleteState} onClose={() => setDeleteState(null)} onConfirm={async (state) => { await run(() => deleteMeal(state.id), "Meal removed"); }} />
  </>;
}

function OrderButtons({ index, total, onMove, label }: { index: number; total: number; onMove: (index: number, offset: number) => void; label: string }) {
  return <div className="flex shrink-0"><Button type="button" variant="ghost" size="iconSm" disabled={index === 0} aria-label={`Move ${label} up`} onClick={() => onMove(index, -1)}><ArrowUp /></Button><Button type="button" variant="ghost" size="iconSm" disabled={index === total - 1} aria-label={`Move ${label} down`} onClick={() => onMove(index, 1)}><ArrowDown /></Button></div>;
}

function FoodItemDialog({ editor, foodNames, onClose, onSave }: { editor: { meal: MealWithItems; item?: MealPlanItem } | null; foodNames: string[]; onClose: () => void; onSave: (v: ItemValues) => Promise<void> }) {
  const item = editor?.item;
  const [form, setForm] = useState({ food_name: "", quantity: "", unit: "g", preparation: "" });
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (editor) setForm({ food_name: item?.food_name ?? "", quantity: item ? String(item.quantity) : "", unit: item?.unit ?? "g", preparation: item?.preparation ?? "" }); }, [editor, item]);
  return <Dialog open={editor !== null} onOpenChange={(open) => { if (!open) onClose(); }}><DialogContent><form onSubmit={async (e) => { e.preventDefault(); setSaving(true); try { await onSave({ food_name: form.food_name, quantity: Number(form.quantity), unit: form.unit, preparation: form.preparation || null }); onClose(); } finally { setSaving(false); } }}><DialogHeader><DialogTitle>{item ? "Edit Food" : "Add Food"}</DialogTitle><DialogDescription>{editor?.meal.meal_name}</DialogDescription></DialogHeader><div className="mt-5 grid gap-4 sm:grid-cols-2"><div className="sm:col-span-2"><FieldLabel htmlFor="food-name">Food</FieldLabel><Input id="food-name" list="food-options-list" required value={form.food_name} onChange={(e) => setForm({ ...form, food_name: e.target.value })} /><datalist id="food-options-list">{foodNames.map((name) => <option key={name} value={name} />)}</datalist></div><div><FieldLabel htmlFor="food-quantity">Quantity</FieldLabel><Input id="food-quantity" type="number" min="0.01" step="any" required value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></div><div><FieldLabel htmlFor="food-unit">Unit</FieldLabel><Input id="food-unit" list="food-units-list" required value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /><datalist id="food-units-list">{UNITS.map((unit) => <option key={unit} value={unit} />)}</datalist></div><div className="sm:col-span-2"><FieldLabel htmlFor="food-preparation" hint="optional">Preparation</FieldLabel><Input id="food-preparation" placeholder="grilled, cooked, steamed…" value={form.preparation} onChange={(e) => setForm({ ...form, preparation: e.target.value })} /></div></div><DialogFooter className="mt-6"><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save Food"}</Button></DialogFooter></form></DialogContent></Dialog>;
}

function FoodOptionsSection({ categories, run }: { categories: CategoryWithOptions[]; run: Runner }) {
  const [editor, setEditor] = useState<NameEditor | null>(null);
  const [deleteState, setDeleteState] = useState<DeleteState>(null);
  const moveCategory = (index: number, offset: number) => { const current = categories[index]; const other = categories[index + offset]; if (current && other) void run(() => reorderCategories(current, other), "Category order updated"); };
  return <>
    <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">Food Options</h2><Button variant="soft" size="sm" onClick={() => setEditor({ type: "category", value: "", sortOrder: categories.length })}><Plus /> Add Category</Button></div>
    {categories.length === 0 ? <Card><EmptyState title="No food categories yet" /></Card> : <div className="grid gap-4 lg:grid-cols-2">{categories.map((category, index) => <Card key={category.id}><div className="flex items-center gap-2"><h3 className="min-w-0 flex-1 truncate text-base font-semibold">{category.name}</h3><OrderButtons index={index} total={categories.length} onMove={moveCategory} label="category" /><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="iconSm" aria-label={`Manage ${category.name}`}><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => setEditor({ type: "category", id: category.id, value: category.name, sortOrder: category.sort_order })}>Rename category</DropdownMenuItem><DropdownMenuItem onClick={() => setDeleteState({ kind: "category", id: category.id, name: category.name })}>Delete category</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div><div className="mt-4 divide-y divide-border">{category.options.map((option, optionIndex) => <div key={option.id} className="flex min-h-10 items-center gap-2 py-1.5"><span className="min-w-0 flex-1 text-sm">{option.name}</span><OrderButtons index={optionIndex} total={category.options.length} label="option" onMove={(i, o) => { const current = category.options[i]; const other = category.options[i + o]; if (current && other) void run(() => reorderFoodOptions(current, other), "Option order updated"); }} /><Button variant="ghost" size="iconSm" aria-label={`Rename ${option.name}`} onClick={() => setEditor({ type: "option", id: option.id, parentId: category.id, value: option.name, sortOrder: option.sort_order })}><Pencil /></Button><Button variant="ghost" size="iconSm" aria-label={`Delete ${option.name}`} onClick={() => void run(() => deleteFoodOption(option.id), "Option removed")}><Trash2 /></Button></div>)}</div><Button className="mt-3" variant="ghost" size="sm" onClick={() => setEditor({ type: "option", parentId: category.id, value: "", sortOrder: category.options.length })}><Plus /> Add Option</Button></Card>)}</div>}
    <NameDialog editor={editor} onClose={() => setEditor(null)} title={editor?.type === "category" ? (editor.id ? "Rename Category" : "Add Category") : (editor?.id ? "Rename Option" : "Add Option")} label={editor?.type === "category" ? "Category name" : "Food name"} onSave={async (e) => { if (e.type === "category") { if (e.id) await run(() => renameCategory(e.id as string, e.value), "Category renamed"); else await run(() => addCategory(e.value, e.sortOrder), "Category added"); } else { if (e.id) await run(() => renameFoodOption(e.id as string, e.value), "Option renamed"); else await run(() => addFoodOption(e.parentId ?? "", e.value, e.sortOrder), "Option added"); } }} />
    <ConfirmDelete state={deleteState} onClose={() => setDeleteState(null)} onConfirm={async (state) => { await run(() => deleteCategory(state.id), "Category removed"); }} />
  </>;
}

function NameDialog({ editor, onClose, title, label, onSave }: { editor: NameEditor | null; onClose: () => void; title: string; label: string; onSave: (e: NameEditor) => Promise<void> }) {
  const [value, setValue] = useState(""); const [saving, setSaving] = useState(false);
  useEffect(() => { if (editor) setValue(editor.value); }, [editor]);
  return <Dialog open={editor !== null} onOpenChange={(open) => { if (!open) onClose(); }}><DialogContent><form onSubmit={async (event) => { event.preventDefault(); if (!editor || !value.trim()) return; setSaving(true); try { await onSave({ ...editor, value: value.trim() }); onClose(); } finally { setSaving(false); } }}><DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader><div className="mt-4"><FieldLabel htmlFor="name-editor">{label}</FieldLabel><Input id="name-editor" autoFocus required value={value} onChange={(e) => setValue(e.target.value)} /></div><DialogFooter className="mt-6"><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</Button></DialogFooter></form></DialogContent></Dialog>;
}

function ConfirmDelete({ state, onClose, onConfirm }: { state: DeleteState; onClose: () => void; onConfirm: (state: NonNullable<DeleteState>) => Promise<void> }) {
  return <AlertDialog open={state !== null} onOpenChange={(open) => !open && onClose()}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Remove {state?.name}?</AlertDialogTitle><AlertDialogDescription>{state?.kind === "category" ? "All food options in this category will also be deleted." : "All food items in this meal will also be deleted."}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={async () => { if (state) await onConfirm(state); onClose(); }}>Remove</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>;
}
