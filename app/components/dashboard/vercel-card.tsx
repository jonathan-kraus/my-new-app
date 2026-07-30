"use client";

import React from "react";
import type { VersionAllResponse } from "@/hooks/useVersionSWR"; // adjust path

interface VercelCardProps {
  data: VersionAllResponse;
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
  headerColor?: string; // <-- add this
}

interface RowProps {
  label: string;
  value: string | number | null;
}

export function VercelCard({ data }: VercelCardProps) {
  const {
    name,
    version,
    buildTime,
    commit,
    dependencies,
    devDependencies,
    overrides,
    workspacePackages,
  } = data;

  return (
    <div className="vercel-card">
      <Section title="App" headerColor="text-yellow-300">
        <Row label="Name" value={name} />
        <Row label="Version" value={version} />
        <Row label="Commit" value={commit} />
        <Row label="Build Time" value={buildTime} />
      </Section>

      {/* Workspace Packages (alphabetized) */}
      {workspacePackages && Object.keys(workspacePackages).length > 0 && (
        <Section title="Workspace Packages" headerColor="text-yellow-300">
          {Object.entries(workspacePackages)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([pkg, ver]) => (
              <Row key={pkg} label={pkg} value={ver} />
            ))}
        </Section>
      )}

      {/* Dependencies */}
      <Section title="Dependencies" headerColor="text-yellow-300">
        {Object.entries(dependencies)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([pkg, ver]) => (
            <Row key={pkg} label={pkg} value={ver} />
          ))}
      </Section>

      {/* Dev Dependencies */}
      <Section title="Dependencies" headerColor="text-yellow-300">
        {Object.entries(devDependencies)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([pkg, ver]) => (
            <Row key={pkg} label={pkg} value={ver} />
          ))}
      </Section>

      {/* Overrides */}
      {overrides && Object.keys(overrides).length > 0 && (
        <Section title="Overrides" headerColor="text-yellow-300">
          {Object.entries(overrides)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([pkg, ver]) => (
              <Row key={pkg} label={pkg} value={ver} />
            ))}
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: SectionProps) {
  return (
    <div className="section">
      <h3 className="section-title">{title}</h3>
      <div className="section-body">{children}</div>
    </div>
  );
}

function Row({ label, value }: RowProps) {
  return (
    <div className="row grid grid-cols-2 gap-4">
      <span className="row-label">{label}</span>
      <span className="row-value text-right">{value}</span>
    </div>
  );
}
