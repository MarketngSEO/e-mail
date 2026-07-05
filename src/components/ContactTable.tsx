import React, { useState } from "react";
import { Search, Trash2, Mail, Smartphone, Globe, RefreshCcw, ToggleLeft, ToggleRight, CheckSquare, Square } from "lucide-react";
import { Contact } from "../types";

interface ContactTableProps {
  contacts: Contact[];
  selectedContactIds: Set<string>;
  onToggleContact: (id: string) => void;
  onToggleAllContacts: (checked: boolean) => void;
  onDeleteContact: (id: string) => Promise<void>;
  onToggleUnsubscribe: (id: string, currentlyUnsubscribed: boolean) => Promise<void>;
}

export default function ContactTable({
  contacts,
  selectedContactIds,
  onToggleContact,
  onToggleAllContacts,
  onDeleteContact,
  onToggleUnsubscribe
}: ContactTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "emails" | "phones">("all");

  // Filter contacts based on search and selected filter tab
  const filteredContacts = contacts.filter((contact) => {
    const emailStr = (contact.email || "").toLowerCase();
    const phoneStr = (contact.phone || "").toLowerCase();
    const sourceStr = (contact.source || "").toLowerCase();
    const term = searchTerm.toLowerCase();

    const matchesSearch =
      emailStr.includes(term) || phoneStr.includes(term) || sourceStr.includes(term);

    if (!matchesSearch) return false;

    if (filterType === "emails") {
      return !!contact.email;
    }
    if (filterType === "phones") {
      return !!contact.phone;
    }
    return true;
  });

  const allFilteredChecked =
    filteredContacts.length > 0 &&
    filteredContacts.every((c) => selectedContactIds.has(c.id));

  const handleToggleAll = () => {
    onToggleAllContacts(!allFilteredChecked);
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return "-";
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-lg font-medium text-slate-900">
            Subscribers & Leads List ({contacts.length})
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Review and check/uncheck subscribers to target them for campaigns. Unchecked subscribers will not receive emails.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search email, phone, or source..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-950 focus:border-slate-950 text-sm transition-all"
            id="search-subscriber-input"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-slate-100 px-6 bg-slate-50/20">
        <button
          onClick={() => setFilterType("all")}
          className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
            filterType === "all"
              ? "border-slate-900 text-slate-900 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-900"
          }`}
          id="btn-filter-all"
        >
          All Contacts ({contacts.length})
        </button>
        <button
          onClick={() => setFilterType("emails")}
          className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
            filterType === "emails"
              ? "border-slate-900 text-slate-900 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-900"
          }`}
          id="btn-filter-emails"
        >
          Emails Only ({contacts.filter((c) => c.email).length})
        </button>
        <button
          onClick={() => setFilterType("phones")}
          className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
            filterType === "phones"
              ? "border-slate-900 text-slate-900 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-900"
          }`}
          id="btn-filter-phones"
        >
          Mobile Numbers ({contacts.filter((c) => c.phone).length})
        </button>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        {filteredContacts.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-sm">No subscriber contacts found matching the filters.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold select-none">
              <tr>
                <th className="p-4 w-12 text-center">
                  <button
                    onClick={handleToggleAll}
                    className="text-slate-500 hover:text-slate-950 focus:outline-none"
                    id="checkbox-select-all"
                    title="Select All"
                  >
                    {allFilteredChecked ? (
                      <CheckSquare className="h-4 w-4" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                </th>
                <th className="p-4 font-semibold">Subscriber Contact</th>
                <th className="p-4 font-semibold">Source / Origin</th>
                <th className="p-4 font-semibold">Marketing Opt-In</th>
                <th className="p-4 font-semibold">Date Collected</th>
                <th className="p-4 font-semibold text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredContacts.map((contact) => {
                const isSelected = selectedContactIds.has(contact.id);
                return (
                  <tr
                    key={contact.id}
                    className={`hover:bg-slate-50/50 transition-colors ${
                      contact.unsubscribed ? "opacity-50" : ""
                    }`}
                  >
                    <td className="p-4 text-center">
                      <button
                        onClick={() => onToggleContact(contact.id)}
                        className="text-slate-500 hover:text-slate-950 focus:outline-none"
                        id={`checkbox-select-${contact.id}`}
                        disabled={contact.unsubscribed}
                        title={contact.unsubscribed ? "Unsubscribed" : "Toggle selection"}
                      >
                        {isSelected ? (
                          <CheckSquare className="h-4 w-4 text-slate-900" />
                        ) : (
                          <Square className={`h-4 w-4 ${contact.unsubscribed ? "opacity-20" : ""}`} />
                        )}
                      </button>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        {contact.email && (
                          <div className="flex items-center gap-1.5 font-medium text-slate-900">
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            <span>{contact.email}</span>
                          </div>
                        )}
                        {contact.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                            <Smartphone className="h-3.5 w-3.5 text-slate-400" />
                            <span>{contact.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="p-4 text-xs font-mono">
                      <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-sans font-medium text-[11px]">
                        <Globe className="h-3 w-3" />
                        {contact.source}
                      </span>
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => onToggleUnsubscribe(contact.id, !!contact.unsubscribed)}
                        className="flex items-center gap-1.5 focus:outline-none text-xs font-semibold text-slate-600 hover:text-slate-950 transition-colors"
                        id={`btn-unsubscribe-toggle-${contact.id}`}
                      >
                        {contact.unsubscribed ? (
                          <>
                            <ToggleLeft className="h-5 w-5 text-slate-400" />
                            <span className="text-slate-400">Unsubscribed</span>
                          </>
                        ) : (
                          <>
                            <ToggleRight className="h-5 w-5 text-emerald-600" />
                            <span className="text-emerald-700">Subscribed</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="p-4 text-xs text-slate-500 font-mono">
                      {formatDate(contact.timestamp)}
                    </td>

                    <td className="p-4 text-center">
                      <button
                        onClick={() => onDeleteContact(contact.id)}
                        className="text-slate-400 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition-all focus:outline-none"
                        id={`btn-delete-contact-${contact.id}`}
                        title="Delete subscriber completely"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
