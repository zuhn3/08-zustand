// app/notes/filter/[...slug]/Notes.client.tsx
"use client";
import css from "@/app/notes/filter/[...slug]/Notes.client.module.css";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { Tag } from "@/types/note";
import Link from "next/link";
import fetchNotes from "@/lib/api";
import type { FetchNotesResponse } from "@/lib/api";
import NoteList from "@/components/NoteList/NoteList";
import Pagination from "@/components/Pagination/Pagination";
import SearchBox from "@/components/SearchBox/SearchBox";
import Loader from "@/components/Loader/Loader";
import ErrorMessage from "@/components/ErrorMessage/ErrorMessage";

interface NotesClientProps {
  initialData: FetchNotesResponse;
  selectedTag?: Tag | undefined;
}

export default function NotesClient({
  initialData,
  selectedTag,
}: NotesClientProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 800);
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, selectedTag]);
  const { data, isLoading, isError, error } = useQuery<FetchNotesResponse>({
    queryKey: ["notes", currentPage, debouncedSearchQuery, selectedTag],
    queryFn: () =>
      fetchNotes({
        page: currentPage,
        search: debouncedSearchQuery,
        ...(selectedTag && selectedTag !== undefined
          ? { tag: selectedTag }
          : {}),
        tag: selectedTag,
      }),
    refetchOnMount: false,
    placeholderData:
      currentPage === 1 && debouncedSearchQuery === "" && !selectedTag
        ? initialData
        : keepPreviousData,
  });

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <div className={css.left}>
          <SearchBox value={searchQuery} onChange={setSearchQuery} />
        </div>
        <div className={css.center}>
          {data?.totalPages && data.totalPages > 1 && (
            <Pagination
              totalPages={data.totalPages}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          )}
        </div>
        <div className={css.right}>
          <Link href={"/notes/action/create"} className={css.button}>
            Create note +
          </Link>
        </div>
      </header>
      {isLoading ? (
        <Loader />
      ) : isError ? (
        <ErrorMessage message={error?.message ?? "Unknown error"} />
      ) : data && data.notes.length > 0 ? (
        <NoteList notes={data.notes} />
      ) : (
        <p>No notes found</p>
      )}
    </div>
  );
}