"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Users, ExternalLink } from "lucide-react";
import type { UserGroup } from "@/types";

interface UserGroupCardsProps {
  groups: UserGroup[];
}

export function UserGroupCards({ groups }: UserGroupCardsProps) {
  const topGroups = groups.slice(0, 4);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {topGroups.map((group) => (
        <div
          key={group.usergroupId}
          className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-galaxy-card transition-all hover:border-primary-400/60 hover:shadow-galaxy-cyan"
        >
          <div className="flex items-center justify-between">
            <span className="rounded bg-primary-400/10 px-2 py-0.5 font-mono text-[10px] font-bold text-primary-400 border border-primary-400/20">
              {group.usergroupCode}
            </span>
            <ShieldCheck className="h-4 w-4 text-primary-400" />
          </div>

          <h4 className="mt-3 text-sm font-bold text-slate-900 dark:text-slate-100 font-heading truncate" title={group.usergroupName}>
            {group.usergroupName}
          </h4>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-galaxy-border/50 text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Users className="h-3 w-3" />
              {group._count?.users ?? 0} Anggota
            </span>
            <Link
              href={`/permissions?group=${group.usergroupId}`}
              className="inline-flex items-center gap-1 font-semibold text-primary-400 hover:underline text-[11px]"
            >
              Hak Akses <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
