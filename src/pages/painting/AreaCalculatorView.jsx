import React, { useState, useMemo } from "react";
import {
  Ruler,
  Plus,
  Trash2,
  DoorOpen,
  RectangleHorizontal,
  Info,
} from "lucide-react";

const COVERAGE_DEFAULTS = {
  "Smooth wall (1 coat)": 12,
  "Smooth wall (2 coats)": 6,
  "Textured / rough wall": 8,
  "Primer / sealer": 10,
  Ceiling: 11,
};

const emptyWall = { label: "", length: "", height: "" };
const emptyOpening = { label: "", width: "", height: "", type: "door" };

let idCounter = 0;
const nextId = () => `id_${idCounter++}`;

export default function AreaCalculatorView() {
  const [walls, setWalls] = useState([
    { id: nextId(), label: "Wall A", length: "", height: "" },
  ]);
  const [openings, setOpenings] = useState([]);
  const [surfaceType, setSurfaceType] = useState("Smooth wall (2 coats)");
  const [coverage, setCoverage] = useState(
    COVERAGE_DEFAULTS["Smooth wall (2 coats)"],
  );
  const [containerSize, setContainerSize] = useState("5");
  const [wastagePct, setWastagePct] = useState("10");

  const addWall = () => {
    setWalls((prev) => [
      ...prev,
      {
        id: nextId(),
        label: `Wall ${String.fromCharCode(65 + prev.length)}`,
        length: "",
        height: "",
      },
    ]);
  };

  const removeWall = (id) => {
    setWalls((prev) => prev.filter((w) => w.id !== id));
  };

  const updateWall = (id, field, value) => {
    setWalls((prev) =>
      prev.map((w) => (w.id === id ? { ...w, [field]: value } : w)),
    );
  };

  const addOpening = () => {
    setOpenings((prev) => [
      ...prev,
      { id: nextId(), label: "", width: "", height: "", type: "door" },
    ]);
  };

  const removeOpening = (id) => {
    setOpenings((prev) => prev.filter((o) => o.id !== id));
  };

  const updateOpening = (id, field, value) => {
    setOpenings((prev) =>
      prev.map((o) => (o.id === id ? { ...o, [field]: value } : o)),
    );
  };

  const handleSurfaceChange = (value) => {
    setSurfaceType(value);
    setCoverage(COVERAGE_DEFAULTS[value]);
  };

  const results = useMemo(() => {
    const grossArea = walls.reduce((sum, w) => {
      const l = Number(w.length) || 0;
      const h = Number(w.height) || 0;
      return sum + l * h;
    }, 0);

    const openingsArea = openings.reduce((sum, o) => {
      const w = Number(o.width) || 0;
      const h = Number(o.height) || 0;
      return sum + w * h;
    }, 0);

    const netArea = Math.max(grossArea - openingsArea, 0);

    const coverageNum = Number(coverage) || 1;
    const wastage = Number(wastagePct) || 0;
    const litresNeeded = (netArea / coverageNum) * (1 + wastage / 100);

    const containerNum = Number(containerSize) || 1;
    const containersNeeded =
      litresNeeded > 0 ? Math.ceil(litresNeeded / containerNum) : 0;

    return {
      grossArea,
      openingsArea,
      netArea,
      litresNeeded,
      containersNeeded,
    };
  }, [walls, openings, coverage, containerSize, wastagePct]);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Ruler className="w-6 h-6 text-indigo-600" />
          </div>
          Area Calculator
        </h1>
        <p className="text-slate-600 mt-1 ml-13">
          Estimate paintable area and litres of paint needed
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Inputs */}
        <div className="lg:col-span-2 space-y-5">
          {/* Walls */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <RectangleHorizontal className="w-5 h-5 text-indigo-600" />
                Walls / Surfaces
              </h2>
              <button
                onClick={addWall}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-sm font-semibold rounded-lg hover:bg-indigo-100 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Wall
              </button>
            </div>

            <div className="space-y-3">
              {walls.map((wall, idx) => (
                <div
                  key={wall.id}
                  className="grid grid-cols-12 gap-2 items-end bg-slate-50 p-3 rounded-lg border border-slate-200"
                >
                  <div className="col-span-4">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Label
                    </label>
                    <input
                      type="text"
                      value={wall.label}
                      onChange={(e) =>
                        updateWall(wall.id, "label", e.target.value)
                      }
                      placeholder={`Wall ${idx + 1}`}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Length (m)
                    </label>
                    <input
                      type="number"
                      value={wall.length}
                      onChange={(e) =>
                        updateWall(wall.id, "length", e.target.value)
                      }
                      placeholder="0"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Height (m)
                    </label>
                    <input
                      type="number"
                      value={wall.height}
                      onChange={(e) =>
                        updateWall(wall.id, "height", e.target.value)
                      }
                      placeholder="0"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <button
                      onClick={() => removeWall(wall.id)}
                      disabled={walls.length === 1}
                      className={`p-2 rounded-lg transition-all ${
                        walls.length === 1
                          ? "text-slate-300 cursor-not-allowed"
                          : "text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                      }`}
                      title="Remove wall"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Openings (doors/windows to deduct) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <DoorOpen className="w-5 h-5 text-indigo-600" />
                Doors &amp; Windows
                <span className="text-xs font-medium text-slate-400">
                  (deducted from area)
                </span>
              </h2>
              <button
                onClick={addOpening}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-sm font-semibold rounded-lg hover:bg-indigo-100 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Opening
              </button>
            </div>

            {openings.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">
                No openings added — full wall area will be used
              </p>
            ) : (
              <div className="space-y-3">
                {openings.map((o) => (
                  <div
                    key={o.id}
                    className="grid grid-cols-12 gap-2 items-end bg-slate-50 p-3 rounded-lg border border-slate-200"
                  >
                    <div className="col-span-3">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Type
                      </label>
                      <select
                        value={o.type}
                        onChange={(e) =>
                          updateOpening(o.id, "type", e.target.value)
                        }
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
                      >
                        <option value="door">Door</option>
                        <option value="window">Window</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="col-span-3">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Width (m)
                      </label>
                      <input
                        type="number"
                        value={o.width}
                        onChange={(e) =>
                          updateOpening(o.id, "width", e.target.value)
                        }
                        placeholder="0"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Height (m)
                      </label>
                      <input
                        type="number"
                        value={o.height}
                        onChange={(e) =>
                          updateOpening(o.id, "height", e.target.value)
                        }
                        placeholder="0"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Qty x1
                      </label>
                      <input
                        type="text"
                        value={o.label}
                        onChange={(e) =>
                          updateOpening(o.id, "label", e.target.value)
                        }
                        placeholder="optional note"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button
                        onClick={() => removeOpening(o.id)}
                        className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Paint settings */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Paint Settings
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Surface Type
                </label>
                <select
                  value={surfaceType}
                  onChange={(e) => handleSurfaceChange(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
                >
                  {Object.keys(COVERAGE_DEFAULTS).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Coverage (m²/litre)
                </label>
                <input
                  type="number"
                  value={coverage}
                  onChange={(e) => setCoverage(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Container Size (L)
                </label>
                <select
                  value={containerSize}
                  onChange={(e) => setContainerSize(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
                >
                  <option value="1">1 L</option>
                  <option value="5">5 L</option>
                  <option value="20">20 L</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Wastage Allowance (%)
                </label>
                <input
                  type="number"
                  value={wastagePct}
                  onChange={(e) => setWastagePct(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
            <div className="mt-4 flex items-start gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                Coverage figures are typical estimates — always check the
                specific product's technical data sheet for accurate coverage
                rates.
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT: Results */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl shadow-lg p-6 text-white sticky top-4">
            <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
              <Ruler className="w-5 h-5" />
              Estimate
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-indigo-400/30">
                <span className="text-indigo-100 text-sm">Gross Wall Area</span>
                <span className="font-bold">
                  {results.grossArea.toFixed(2)} m²
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-indigo-400/30">
                <span className="text-indigo-100 text-sm">Doors / Windows</span>
                <span className="font-bold">
                  −{results.openingsArea.toFixed(2)} m²
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-indigo-400/30">
                <span className="text-indigo-100 text-sm">
                  Net Paintable Area
                </span>
                <span className="font-bold text-xl">
                  {results.netArea.toFixed(2)} m²
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-indigo-400/30">
                <span className="text-indigo-100 text-sm">Paint Required</span>
                <span className="font-bold text-xl">
                  {results.litresNeeded.toFixed(1)} L
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-indigo-100 text-sm">
                  {containerSize}L Containers
                </span>
                <span className="font-bold text-2xl">
                  {results.containersNeeded}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-indigo-400/30 text-xs text-indigo-100">
              Includes a {wastagePct || 0}% wastage allowance based on{" "}
              {coverage} m² per litre coverage.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
