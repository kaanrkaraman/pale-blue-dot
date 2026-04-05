import { useCallback, useEffect, useRef, useState } from "react";
import { getChildrenFrom } from "../core/data";
import type { CelestialBodyData } from "../core/types";
import { useSimStore } from "../store";

function BodyItem({
  body,
  allBodies,
  depth,
  defaultExpanded,
}: {
  body: CelestialBodyData;
  allBodies: CelestialBodyData[];
  depth: number;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded ?? false);
  const selectedBodyId = useSimStore((s) => s.selectedBodyId);
  const selectBody = useSimStore((s) => s.selectBody);

  const children = getChildrenFrom(allBodies, body.id);
  const hasChildren = children.length > 0;
  const isSelected = selectedBodyId === body.id;

  const handleClick = useCallback(() => {
    selectBody(body.id);
  }, [body.id, selectBody]);

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((v) => !v);
  }, []);

  return (
    <div>
      <div
        className={`body-item ${isSelected ? "selected" : ""}`}
        style={{ paddingLeft: `${8 + depth * 14}px` }}
        onClick={handleClick}
      >
        {hasChildren ? (
          <span className="toggle" onClick={handleToggle}>
            {expanded ? "▾" : "▸"}
          </span>
        ) : (
          <span className="toggle-spacer" />
        )}
        <span
          className={`body-dot ${body.type === "probe" || body.type === "comet" ? "diamond" : ""}`}
          style={{ backgroundColor: body.color }}
        />
        <span className="body-name">{body.name}</span>
      </div>
      {hasChildren && (
        <div className={`body-children ${expanded ? "expanded" : ""}`}>
          <div className="body-children-inner">
            {children.map((child) => (
              <BodyItem key={child.id} body={child} allBodies={allBodies} depth={depth + 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SectionToggle({ title, expanded, onToggle }: { title: string; expanded: boolean; onToggle: () => void }) {
  return (
    <div className="body-section-title" onClick={onToggle} style={{ cursor: "pointer" }}>
      <span className="toggle" style={{ display: "inline-block", marginRight: 4 }}>
        {expanded ? "▾" : "▸"}
      </span>
      {title}
    </div>
  );
}

export function BodySelector() {
  const panelRef = useRef<HTMLDivElement>(null);
  const selectedBodyId = useSimStore((s) => s.selectedBodyId);
  const activeBodies = useSimStore((s) => s.activeBodies);
  const showProbes = useSimStore((s) => s.showProbes);
  const showDwarfPlanets = useSimStore((s) => s.showDwarfPlanets);
  const showComets = useSimStore((s) => s.showComets);
  const leftPanelOpen = useSimStore((s) => s.leftPanelOpen);
  const toggleLeftPanel = useSimStore((s) => s.toggleLeftPanel);

  const [planetsExpanded, setPlanetsExpanded] = useState(true);
  const [dwarfPlanetsExpanded, setDwarfPlanetsExpanded] = useState(false);
  const [probesExpanded, setProbesExpanded] = useState(true);
  const [cometsExpanded, setCometsExpanded] = useState(false);

  useEffect(() => {
    if (showDwarfPlanets) setDwarfPlanetsExpanded(true);
  }, [showDwarfPlanets]);

  useEffect(() => {
    if (showComets) setCometsExpanded(true);
  }, [showComets]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: selectedBodyId triggers scroll-to-selected
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const selected = panel.querySelector(".body-item.selected");
    if (selected) {
      selected.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [selectedBodyId]);

  const centerBody = activeBodies[0];
  const planets = activeBodies.filter((b) => b.type === "planet");
  const dwarfPlanets = activeBodies.filter((b) => b.type === "dwarf-planet");
  const probes = activeBodies.filter((b) => b.type === "probe");
  const comets = activeBodies.filter((b) => b.type === "comet");

  if (!leftPanelOpen) {
    return (
      <div className="panel-expand left-expand" onClick={toggleLeftPanel}>
        <span className="expand-icon">»</span>
      </div>
    );
  }

  return (
    <div className="panel left-panel" ref={panelRef}>
      <div className="panel-header">
        <span className="panel-title">Bodies</span>
        <button type="button" className="panel-collapse-btn" onClick={toggleLeftPanel} title="Collapse panel">
          «
        </button>
      </div>
      <div className="body-list">
        {centerBody && <BodyItem body={centerBody} allBodies={activeBodies} depth={0} />}

        <SectionToggle title="Planets" expanded={planetsExpanded} onToggle={() => setPlanetsExpanded((v) => !v)} />
        <div className={`body-children ${planetsExpanded ? "expanded" : ""}`}>
          <div className="body-children-inner">
            {planets.map((planet) => (
              <BodyItem key={planet.id} body={planet} allBodies={activeBodies} depth={1} />
            ))}
          </div>
        </div>

        {dwarfPlanets.length > 0 && (
          <>
            <SectionToggle
              title="Dwarf Planets"
              expanded={dwarfPlanetsExpanded}
              onToggle={() => setDwarfPlanetsExpanded((v) => !v)}
            />
            <div className={`body-children ${dwarfPlanetsExpanded ? "expanded" : ""}`}>
              <div className="body-children-inner">
                {dwarfPlanets.map((dp) => (
                  <BodyItem key={dp.id} body={dp} allBodies={activeBodies} depth={1} />
                ))}
              </div>
            </div>
          </>
        )}

        {showProbes && probes.length > 0 && (
          <>
            <SectionToggle title="Probes" expanded={probesExpanded} onToggle={() => setProbesExpanded((v) => !v)} />
            <div className={`body-children ${probesExpanded ? "expanded" : ""}`}>
              <div className="body-children-inner">
                {probes.map((probe) => (
                  <BodyItem key={probe.id} body={probe} allBodies={activeBodies} depth={1} />
                ))}
              </div>
            </div>
          </>
        )}

        {showComets && comets.length > 0 && (
          <>
            <SectionToggle title="Comets" expanded={cometsExpanded} onToggle={() => setCometsExpanded((v) => !v)} />
            <div className={`body-children ${cometsExpanded ? "expanded" : ""}`}>
              <div className="body-children-inner">
                {comets.map((comet) => (
                  <BodyItem key={comet.id} body={comet} allBodies={activeBodies} depth={1} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
