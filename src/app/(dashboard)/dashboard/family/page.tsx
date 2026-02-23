"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ArrowDownLeft, ArrowUpRight, Loader2, Plus, Trash2, Users, StickyNote, Check, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface FamilyTransaction {
  id: string;
  fromPerson: string;
  toPerson: string;
  amount: number;
  note?: string;
  date: string;
}

interface FamilyNote {
  id: string;
  title: string;
  content: string;
  type: string;
  targetPerson?: string;
  amount?: number;
  isCompleted: boolean;
  dueDate?: string;
  createdAt: string;
}

interface FamilyMember {
  id: string;
  name: string;
  relation?: string;
}

interface Balance {
  person: string;
  balance: number;
}

export default function FamilyLedgerPage() {
  const [transactions, setTransactions] = useState<FamilyTransaction[]>([]);
  const [notes, setNotes] = useState<FamilyNote[]>([]);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRelation, setNewMemberRelation] = useState("");
  const [formData, setFormData] = useState({
    fromPerson: "",
    toPerson: "",
    amount: "",
    note: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [noteFormData, setNoteFormData] = useState({
    title: "",
    content: "",
    type: "REMINDER",
    targetPerson: "",
    amount: "",
    dueDate: "",
  });

  const fetchTransactions = async () => {
    try {
      const response = await fetch("/api/family-transactions");
      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotes = async () => {
    try {
      const response = await fetch("/api/family-notes");
      const data = await response.json();
      setNotes(data.notes || []);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await fetch("/api/family-members");
      const data = await response.json();
      setMembers(data.members || []);
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  const calculateBalances = (txns: FamilyTransaction[], memberList: FamilyMember[]) => {
    const balanceMap: Record<string, number> = {};
    memberList.forEach((member) => {
      balanceMap[member.name] = 0;
    });
    txns.forEach((txn) => {
      balanceMap[txn.fromPerson] = (balanceMap[txn.fromPerson] || 0) - txn.amount;
      balanceMap[txn.toPerson] = (balanceMap[txn.toPerson] || 0) + txn.amount;
    });
    const balanceArray = Object.entries(balanceMap)
      .filter(([person]) => memberList.some(m => m.name === person) || balanceMap[person] !== 0)
      .map(([person, balance]) => ({ person, balance }));
    setBalances(balanceArray);
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchMembers();
      await fetchTransactions();
      await fetchNotes();
    };
    loadData();
  }, []);

  useEffect(() => {
    if (members.length > 0) {
      calculateBalances(transactions, members);
    }
  }, [members, transactions]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/family-members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newMemberName, relation: newMemberRelation }),
      });
      if (!response.ok) throw new Error("Failed to add member");
      toast({ title: "Member added" });
      setNewMemberName("");
      setNewMemberRelation("");
      setShowMemberModal(false);
      fetchMembers();
    } catch (error) {
      toast({ title: "Error", description: "Failed to add member", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMember = async (id: string) => {
    try {
      await fetch(`/api/family-members/${id}`, { method: "DELETE" });
      toast({ title: "Member removed" });
      fetchMembers();
    } catch (error) {
      console.error("Error deleting member:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.fromPerson === formData.toPerson) {
      toast({ title: "Error", description: "From and To person cannot be the same", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/family-transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to add transaction");
      toast({ title: "Transaction added", description: "Family transaction recorded successfully." });
      setFormData({ fromPerson: "", toPerson: "", amount: "", note: "", date: new Date().toISOString().split("T")[0] });
      setShowAddModal(false);
      fetchTransactions();
      fetchMembers();
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to add transaction", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/family-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(noteFormData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to add note");
      toast({ title: "Note added", description: "Your reminder has been saved." });
      setNoteFormData({ title: "", content: "", type: "REMINDER", targetPerson: "", amount: "", dueDate: "" });
      setShowNoteModal(false);
      fetchNotes();
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to add note", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/family-transactions/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete transaction");
      toast({ title: "Transaction deleted", description: "The transaction has been removed." });
      fetchTransactions();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete transaction", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  const toggleNoteComplete = async (id: string, isCompleted: boolean) => {
    try {
      await fetch(`/api/family-notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: !isCompleted }),
      });
      fetchNotes();
    } catch (error) {
      console.error("Error updating note:", error);
    }
  };

  const deleteNote = async (id: string) => {
    try {
      await fetch(`/api/family-notes/${id}`, { method: "DELETE" });
      toast({ title: "Note deleted" });
      fetchNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const pendingNotes = notes.filter((n) => !n.isCompleted);
  const completedNotes = notes.filter((n) => n.isCompleted);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Family Ledger</h1>
          <p className="text-gray-500 text-sm mt-1">Track money between family members</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowMemberModal(true)} className="gap-2">
            <Users className="w-4 h-4" />
            Add Member
          </Button>
          <Button variant="outline" onClick={() => setShowNoteModal(true)} className="gap-2">
            <StickyNote className="w-4 h-4" />
            Add Note
          </Button>
          <Button onClick={() => setShowAddModal(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* No Members Message */}
      {members.length === 0 && (
        <Card className="mb-8 border-gray-200">
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="font-medium text-gray-900 mb-2">Add Family Members First</h3>
            <p className="text-sm text-gray-500 mb-4">Add the people you want to track money with</p>
            <Button onClick={() => setShowMemberModal(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Family Member
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Balance Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {balances.map((item) => (
          <Card key={item.person} className="border-gray-200">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                <span className="text-lg font-semibold text-gray-700">
                  {item.person.charAt(0)}
                </span>
              </div>
              <p className="font-medium text-sm text-gray-900">{item.person}</p>
              <p className={`text-lg font-semibold mt-1 ${
                item.balance > 0 ? "text-emerald-600" : item.balance < 0 ? "text-red-500" : "text-gray-400"
              }`}>
                {item.balance > 0 ? "+" : ""}{formatCurrency(item.balance)}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {item.balance > 0 ? "To receive" : item.balance < 0 ? "To pay" : "Settled"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="bg-gray-100">
          <TabsTrigger value="transactions" className="gap-2">
            <Users className="w-4 h-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="notes" className="gap-2">
            <StickyNote className="w-4 h-4" />
            Notes & Reminders
            {pendingNotes.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                {pendingNotes.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium text-gray-900">Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Users className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No transactions yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {transactions.map((txn) => (
                    <div key={txn.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">{txn.fromPerson.charAt(0)}</span>
                          </div>
                          <ArrowRight className="w-3 h-3 text-gray-400" />
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-emerald-700">{txn.toPerson.charAt(0)}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{txn.fromPerson} → {txn.toPerson}</p>
                          <p className="text-xs text-gray-400">
                            {txn.note && <span>{txn.note} • </span>}
                            {formatDate(txn.date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-900">{formatCurrency(txn.amount)}</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-red-500" onClick={() => handleDelete(txn.id)} disabled={deletingId === txn.id}>
                          {deletingId === txn.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <div className="space-y-4">
            {/* Pending Notes */}
            <Card className="border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium flex items-center gap-2 text-gray-900">
                  Pending
                  {pendingNotes.length > 0 && <span className="text-xs text-gray-400">({pendingNotes.length})</span>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingNotes.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">No pending notes</p>
                ) : (
                  <div className="space-y-2">
                    {pendingNotes.map((note) => (
                      <div key={note.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                        <button onClick={() => toggleNoteComplete(note.id, note.isCompleted)} className="mt-0.5 w-5 h-5 rounded border-2 border-gray-300 hover:border-emerald-500 transition-colors flex items-center justify-center" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm text-gray-900">{note.title}</p>
                            {note.type === "SEND_MONEY" && <ArrowUpRight className="w-3.5 h-3.5 text-red-500" />}
                            {note.type === "RECEIVE_MONEY" && <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500" />}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{note.content}</p>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                            {note.targetPerson && <span>→ {note.targetPerson}</span>}
                            {note.amount && <span className="font-medium">{formatCurrency(note.amount)}</span>}
                            {note.dueDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(note.dueDate)}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-neutral-400 hover:text-red-500" onClick={() => deleteNote(note.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Completed Notes */}
            {completedNotes.length > 0 && (
              <Card className="border-gray-200 opacity-60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium text-gray-900">Completed ({completedNotes.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {completedNotes.map((note) => (
                      <div key={note.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                        <button onClick={() => toggleNoteComplete(note.id, note.isCompleted)} className="mt-0.5 w-5 h-5 rounded border-2 border-emerald-500 bg-emerald-500 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm line-through text-gray-400">{note.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{note.content}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-red-500" onClick={() => deleteNote(note.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Transaction Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
            <DialogDescription>Record a money transfer between family members.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">From</Label>
                <Select value={formData.fromPerson} onValueChange={(value) => setFormData({ ...formData, fromPerson: value })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {members.map((m) => <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">To</Label>
                <Select value={formData.toPerson} onValueChange={(value) => setFormData({ ...formData, toPerson: value })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {members.map((m) => <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Amount (₹)</Label>
              <Input type="number" step="0.01" placeholder="0.00" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Note (Optional)</Label>
              <Input placeholder="e.g., Grocery shopping" value={formData.note} onChange={(e) => setFormData({ ...formData, note: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Date</Label>
              <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Note Modal */}
      <Dialog open={showNoteModal} onOpenChange={setShowNoteModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Note / Reminder</DialogTitle>
            <DialogDescription>Create a reminder for money to send or receive.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleNoteSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Type</Label>
              <Select value={noteFormData.type} onValueChange={(value) => setNoteFormData({ ...noteFormData, type: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="REMINDER">General Reminder</SelectItem>
                  <SelectItem value="SEND_MONEY">Money to Send</SelectItem>
                  <SelectItem value="RECEIVE_MONEY">Money to Receive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Title</Label>
              <Input placeholder="e.g., Send money to Mummy" value={noteFormData.title} onChange={(e) => setNoteFormData({ ...noteFormData, title: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Details</Label>
              <Input placeholder="e.g., For monthly expenses" value={noteFormData.content} onChange={(e) => setNoteFormData({ ...noteFormData, content: e.target.value })} required />
            </div>
            {(noteFormData.type === "SEND_MONEY" || noteFormData.type === "RECEIVE_MONEY") && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs">Person</Label>
                  <Select value={noteFormData.targetPerson} onValueChange={(value) => setNoteFormData({ ...noteFormData, targetPerson: value })}>
                    <SelectTrigger><SelectValue placeholder="Select person" /></SelectTrigger>
                    <SelectContent>
                      {members.map((m) => <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Amount (₹)</Label>
                  <Input type="number" step="0.01" placeholder="0.00" value={noteFormData.amount} onChange={(e) => setNoteFormData({ ...noteFormData, amount: e.target.value })} />
                </div>
              </>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs">Due Date (Optional)</Label>
              <Input type="date" value={noteFormData.dueDate} onChange={(e) => setNoteFormData({ ...noteFormData, dueDate: e.target.value })} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowNoteModal(false)}>Cancel</Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Note"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Member Modal */}
      <Dialog open={showMemberModal} onOpenChange={setShowMemberModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Family Member</DialogTitle>
            <DialogDescription>Add a person to track money with.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddMember} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Name</Label>
              <Input placeholder="e.g., Mummy, Papa, Bhai" value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Relation (Optional)</Label>
              <Select value={newMemberRelation} onValueChange={setNewMemberRelation}>
                <SelectTrigger><SelectValue placeholder="Select relation" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Parent">Parent</SelectItem>
                  <SelectItem value="Sibling">Sibling</SelectItem>
                  <SelectItem value="Spouse">Spouse</SelectItem>
                  <SelectItem value="Child">Child</SelectItem>
                  <SelectItem value="Friend">Friend</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowMemberModal(false)}>Cancel</Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Member"}
              </Button>
            </div>
          </form>

          {/* Existing Members */}
          {members.length > 0 && (
            <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <p className="text-xs text-neutral-500 mb-2">Current Members</p>
              <div className="flex flex-wrap gap-2">
                {members.map((m) => (
                  <div key={m.id} className="flex items-center gap-1 px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded text-sm">
                    <span>{m.name}</span>
                    <button onClick={() => handleDeleteMember(m.id)} className="text-neutral-400 hover:text-red-500 ml-1">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
