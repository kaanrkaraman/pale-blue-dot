import { useCallback, useEffect, useRef, useState } from "react";
import { getChildrenFrom } from "../core/data";
import type { CelestialBodyData } from "../core/types";
import { useSimStore } from "../store";

function BodyItem({
  body,
  allBodies,
  depth,
}: {
  body: CelestialBodyData;
  allBodies: CelestialBodyData[];
  depth: number;
}) {
  const [expanded, setExpanded] = useState(true);
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
          className={`body-dot ${body.type === "probe" ? "diamond" : ""}`}
          style={{ backgroundColor: body.color }}
        />
        <span className="body-name">{body.name}</span>
      </div>
      {hasChildren && expanded && (
        <div>
          {children.map((child) => (
            <BodyItem key={child.id} body={child} allBodies={allBodies} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function BodySelector() {
  const panelRef = useRef<HTMLDivElement>(null);
  const selectedBodyId = useSimStore((s) => s.selectedBodyId);
  const activeBodies = useSimStore((s) => s.activeBodies);
  const showProbes = useSimStore((s) => s.showProbes);
  const leftPanelOpen = useSimStore((s) => s.leftPanelOpen);
  const toggleLeftPanel = useSimStore((s) => s.toggleLeftPanel);

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
  const planets = activeBodies.filter((b) => b.type === "planet" || b.type === "dwarf-planet");
  const probes = activeBodies.filter((b) => b.type === "probe");

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
        {planets.map((planet) => (
          <BodyItem key={planet.id} body={planet} allBodies={activeBodies} depth={1} />
        ))}
        {showProbes && probes.length > 0 && (
          <>
            <div className="body-section-title">Probes</div>
            {probes.map((probe) => (
              <BodyItem key={probe.id} body={probe} allBodies={activeBodies} depth={1} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
