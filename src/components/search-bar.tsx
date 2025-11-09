"use client";

import { Download, Plus, Upload } from "lucide-react";
import Link from "next/link";
import { type ChangeEvent, useRef, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { SearchInput } from "./search-input";

export function SearchBar() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { exportNotes, importNotes, isLoading } = useLocalStorage();
  const [pendingImport, setPendingImport] = useState<{
    name: string;
    contents: string;
  } | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = () => {
    const data = exportNotes();
    const blob = new Blob([data], { type: "application/json" });
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `local-notes-${timestamp}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Notes exported successfully");
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      setPendingImport({ name: file.name, contents: text });
      setIsImportDialogOpen(true);
    } catch (err) {
      console.error("Failed to import file", err);
      toast.error("Failed to read the selected file");
    } finally {
      event.target.value = "";
    }
  };

  const resetImportState = () => {
    setPendingImport(null);
    setIsImporting(false);
    setIsImportDialogOpen(false);
  };

  const handleImportDialogOpenChange = (open: boolean) => {
    setIsImportDialogOpen(open);
    if (!open) {
      setPendingImport(null);
      setIsImporting(false);
    }
  };

  const handleConfirmImport = () => {
    if (!pendingImport) {
      resetImportState();
      return;
    }

    setIsImporting(true);
    const result = importNotes(pendingImport.contents);

    if (result.success) {
      const added = result.addedCount ?? 0;
      const skipped = result.skippedCount ?? 0;
      const summary =
        skipped > 0
          ? `Imported ${added} note${added === 1 ? "" : "s"} (${skipped} skipped)`
          : `Imported ${added} note${added === 1 ? "" : "s"}`;
      toast.success(summary);
      if (result.message) {
        toast.message(result.message);
      }
    } else {
      toast.error(result.message ?? "Failed to import notes");
    }

    resetImportState();
  };

  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-center">
        <div className="w-full md:w-1/3">
          <SearchInput />
        </div>
        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
          <Link href="/new">
            <Button className="rounded-full">
              <Plus className="w-4 h-4 mr-2" />
              New
            </Button>
          </Link>
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={handleExport}
            disabled={isLoading}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={handleImportClick}
            disabled={isLoading}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      <AlertDialog
        open={isImportDialogOpen}
        onOpenChange={handleImportDialogOpenChange}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Import Notes</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingImport
                ? `Add notes from "${pendingImport.name}"? Identical title + content entries will be skipped.`
                : "Select a JSON export file to import notes."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full" disabled={isImporting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full"
              onClick={handleConfirmImport}
              disabled={isImporting || !pendingImport}
            >
              {isImporting ? "Importing..." : "Import"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
