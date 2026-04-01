import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import {
  Zap,
  CheckCircle,
  UserCheck,
  Star,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

const db = getFirestore();

export default function AnalyticsPage({ user }) {
  const [data, setData] = useState({
    guards: [],
    sites: [],
    incidents: [],
    routes: [],
    schedules: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    const fetchAll = async () => {
      try {
        const [
          guardsSnap,
          sitesSnap,
          incidentsSnap,
          routesSnap,
          schedulesSnap,
        ] = await Promise.all([
          getDocs(collection(db, "users", user.uid, "guards")),
          getDocs(collection(db, "users", user.uid, "sites")),
          getDocs(collection(db, "users", user.uid, "incidents")),
          getDocs(collection(db, "users", user.uid, "patrolRoutes")),
          getDocs(collection(db, "users", user.uid, "schedules")),
        ]);
        setData({
          guards: guardsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
          sites: sitesSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
          incidents: incidentsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
          routes: routesSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
          schedules: schedulesSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user]);

  const onDutyGuards = data.guards.filter((g) => g.status === "On Duty").length;
  const highRiskSites = data.sites.filter((s) => s.risk === "High").length;
  const resolvedIncidents = data.incidents.filter(
    (i) => i.status === "resolved",
  ).length;
  const activeRoutes = data.routes.filter((r) => r.status === "Active").length;
  const avgRating = data.guards.length
    ? (
        data.guards.reduce((a, g) => a + (parseFloat(g.rating) || 0), 0) /
        data.guards.length
      ).toFixed(1)
    : "—";

  // Incident type breakdown from real data
  const incidentTypes = data.incidents.reduce((acc, inc) => {
    const type = inc.incidentType || "Other";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  const incidentEntries = Object.entries(incidentTypes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxIncCount = incidentEntries.length
    ? Math.max(...incidentEntries.map((e) => e[1]))
    : 1;

  // Top guards by rating
  const topGuards = [...data.guards]
    .sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0))
    .slice(0, 5);

  // Sites by incidents
  const sitesByIncidents = [...data.sites]
    .sort((a, b) => (parseInt(b.incidents) || 0) - (parseInt(a.incidents) || 0))
    .slice(0, 5);

  const COLORS = [
    "bg-[#dc2626]",
    "bg-[#d97706]",
    "bg-[#7c3aed]",
    "bg-[#0284c7]",
    "bg-[#059669]",
  ];

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1e293b]">Analytics</h1>
          <p className="text-sm text-[#64748b] mt-0.5">
            Live performance metrics from your data
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 text-sm border border-[#e2e8f0] text-[#374151] rounded-lg hover:bg-[#f8fafc]"
        >
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Guards On Duty",
            value: loading ? "…" : `${onDutyGuards} / ${data.guards.length}`,
            sub: "Active right now",
            icon: UserCheck,
            bg: "bg-[#eff6ff]",
            color: "text-[#2563eb]",
          },
          {
            label: "Active Routes",
            value: loading ? "…" : activeRoutes,
            sub: "Patrol routes running",
            icon: CheckCircle,
            bg: "bg-[#f0fdf4]",
            color: "text-[#059669]",
          },
          {
            label: "High Risk Sites",
            value: loading ? "…" : highRiskSites,
            sub: "Require attention",
            icon: Zap,
            bg: "bg-[#fef2f2]",
            color: "text-[#dc2626]",
          },
          {
            label: "Avg Guard Rating",
            value: loading ? "…" : avgRating,
            sub: "Out of 5.0",
            icon: Star,
            bg: "bg-[#fef9c3]",
            color: "text-[#ca8a04]",
          },
        ].map(({ label, value, sub, icon: Icon, bg, color }) => (
          <div
            key={label}
            className="bg-white rounded-xl p-4 border border-[#e2e8f0] shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}
              >
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
            </div>
            {loading ? (
              <div className="h-7 bg-[#f1f5f9] rounded animate-pulse mb-1" />
            ) : (
              <p className="text-xl font-bold text-[#1e293b]">{value}</p>
            )}
            <p className="text-xs text-[#64748b]">{label}</p>
            <p className="text-xs text-[#94a3b8] mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Total Incidents",
            value: data.incidents.length,
            color: "text-[#dc2626]",
          },
          {
            label: "Resolved",
            value: resolvedIncidents,
            color: "text-[#059669]",
          },
          {
            label: "Total Sites",
            value: data.sites.length,
            color: "text-[#2563eb]",
          },
          {
            label: "Total Guards",
            value: data.guards.length,
            color: "text-[#7c3aed]",
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-white rounded-xl p-4 border border-[#e2e8f0] shadow-sm text-center"
          >
            {loading ? (
              <div className="h-7 bg-[#f1f5f9] rounded animate-pulse mb-1 mx-auto w-12" />
            ) : (
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            )}
            <p className="text-xs text-[#64748b] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Two-column analysis */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Incident types */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-[#1e293b] mb-4">
            Incidents by Type
          </h3>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-8 bg-[#f8fafc] rounded animate-pulse"
                />
              ))}
            </div>
          ) : incidentEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-[#94a3b8]">No incident data yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {incidentEntries.map(([type, count], i) => {
                const pct = Math.round((count / maxIncCount) * 100);
                return (
                  <div key={type}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[#374151] truncate max-w-[200px]">
                        {type}
                      </span>
                      <span className="text-xs font-semibold text-[#1e293b] ml-2">
                        {count}
                      </span>
                    </div>
                    <div className="w-full bg-[#f1f5f9] rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${COLORS[i % COLORS.length]} transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Guards */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-[#1e293b] mb-4">
            Top Performing Guards
          </h3>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-10 bg-[#f8fafc] rounded animate-pulse"
                />
              ))}
            </div>
          ) : topGuards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-[#94a3b8]">No guard data yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topGuards.map(({ name, rating, status, site }, i) => (
                <div key={name + i} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[#94a3b8] w-4">
                    {i + 1}
                  </span>
                  <div className="w-8 h-8 bg-gradient-to-br from-[#2563eb] to-[#7c3aed] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">
                      {name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") || "?"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1e293b] truncate">
                      {name}
                    </p>
                    <p className="text-xs text-[#94a3b8] truncate">
                      {site || "—"} · {status}
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-1">
                    <Star className="w-3 h-3 text-[#f59e0b] fill-[#f59e0b]" />
                    <p className="text-sm font-bold text-[#059669]">
                      {rating || "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sites by incidents */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-[#1e293b] mb-4">
            Sites by Incident Count
          </h3>
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-8 bg-[#f8fafc] rounded animate-pulse"
                />
              ))}
            </div>
          ) : sitesByIncidents.length === 0 ? (
            <p className="text-sm text-[#94a3b8] text-center py-8">
              No site data yet
            </p>
          ) : (
            <div className="space-y-3">
              {sitesByIncidents.map((s, i) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between py-2 border-b border-[#f1f5f9] last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#94a3b8] w-4">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#1e293b]">
                        {s.name}
                      </p>
                      <p className="text-xs text-[#94a3b8]">
                        {s.risk} Risk · {s.type}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-bold ${(parseInt(s.incidents) || 0) > 0 ? "text-[#dc2626]" : "text-[#059669]"}`}
                  >
                    {s.incidents || 0}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Guard status breakdown */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-[#1e293b] mb-4">
            Guard Status Overview
          </h3>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-8 bg-[#f8fafc] rounded animate-pulse"
                />
              ))}
            </div>
          ) : data.guards.length === 0 ? (
            <p className="text-sm text-[#94a3b8] text-center py-8">
              No guard data yet
            </p>
          ) : (
            <div className="space-y-3">
              {[
                {
                  label: "On Duty",
                  color: "bg-[#059669]",
                  count: data.guards.filter((g) => g.status === "On Duty")
                    .length,
                },
                {
                  label: "Off Duty",
                  color: "bg-[#64748b]",
                  count: data.guards.filter((g) => g.status === "Off Duty")
                    .length,
                },
                {
                  label: "On Leave",
                  color: "bg-[#d97706]",
                  count: data.guards.filter((g) => g.status === "Leave").length,
                },
              ].map(({ label, color, count }) => {
                const pct = data.guards.length
                  ? Math.round((count / data.guards.length) * 100)
                  : 0;
                return (
                  <div key={label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-[#374151]">{label}</span>
                      <span className="text-xs font-semibold text-[#1e293b]">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#f1f5f9] rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${color}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
