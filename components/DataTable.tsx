"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface DataTableProps {
  columns: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  renderRow: (item: any, index: number) => React.ReactNode;
}

export default function DataTable({
  columns,
  data,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
  renderRow,
}: DataTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden flex flex-col">
      <div className="overflow-x-auto flex-1">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              {columns.map((col, index) => (
                <TableHead
                  key={index}
                  className={index === columns.length - 1 ? "text-right" : ""}
                >
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-48 text-center text-slate-500"
                >
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                  <p className="mt-2">กำลังโหลดข้อมูล...</p>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-48 text-center text-slate-500 font-medium"
                >
                  ไม่พบข้อมูล
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, index) => renderRow(item, index))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-6 py-4 border-t bg-slate-50">
        <p className="text-sm text-slate-500">
          หน้า {currentPage} จากทั้งหมด {totalPages || 1} หน้า
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1 || isLoading}
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> ก่อนหน้า
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || isLoading}
          >
            ถัดไป <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
