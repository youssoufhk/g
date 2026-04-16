"use client";

import { useState } from "react";
import {
  ArrowRight,
  Bell,
  Briefcase,
  Check,
  Download,
  Filter,
  LayoutGrid,
  List,
  Network,
  Plus,
  Search,
  Settings,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";

import { PageHeader } from "@/components/patterns/page-header";
import { EmptyState } from "@/components/patterns/empty-state";
import { FilterBar } from "@/components/patterns/filter-bar";
import { StatPill } from "@/components/patterns/stat-pill";
import {
  AIInsightCard,
  AIInvoiceExplanation,
  Accordion,
  AccordionItem,
  Avatar,
  AvatarGroup,
  Badge,
  Breadcrumb,
  Button,
  Checkbox,
  Drawer,
  Dropdown,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  Input,
  Modal,
  Pagination,
  Pill,
  ProgressBar,
  Radio,
  SearchInput,
  SegControl,
  Select,
  Skeleton,
  Spinner,
  Table,
  DataTableWrapper,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Toggle,
  Tooltip,
  useToast,
} from "@/components/ui";

type SectionProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

function Section({ title, description, children }: SectionProps) {
  return (
    <section
      style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}
    >
      <div>
        <h2
          style={{
            fontSize: "var(--text-heading-2)",
            fontWeight: "var(--weight-semibold)",
            color: "var(--color-text-1)",
          }}
        >
          {title}
        </h2>
        {description && <p className="text-2 text-sm">{description}</p>}
      </div>
      <div className="card">
        <div
          className="card-body"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-4)",
          }}
        >
          {children}
        </div>
      </div>
    </section>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "140px 1fr",
        gap: "var(--space-4)",
        alignItems: "center",
      }}
    >
      <div
        className="text-3 text-caption"
        style={{ textTransform: "uppercase", letterSpacing: "0.06em" }}
      >
        {label}
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "var(--space-2)",
          alignItems: "center",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default function DesignSystemPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toggleOn, setToggleOn] = useState(true);
  const [check, setCheck] = useState(true);
  const [radio, setRadio] = useState("weekly");
  const [view, setView] = useState<"grid" | "list" | "org">("grid");
  const [tab, setTab] = useState("profile");
  const [page, setPage] = useState(3);
  const toast = useToast();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-8)",
      }}
    >
      <PageHeader
        title="Design system"
        subtitle="Every atom, every variant, against the prototype CSS. If something here looks off, the atoms are broken."
        actions={
          <>
            <Button variant="secondary" size="md" leadingIcon={<Download size={16} aria-hidden />}>
              Export
            </Button>
            <Button variant="primary" size="md" leadingIcon={<Plus size={16} aria-hidden />}>
              New atom
            </Button>
          </>
        }
      />

      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Design system" },
        ]}
      />

      <Section title="Buttons" description="7 variants x 5 sizes.">
        <Row label="Variants">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="accent">Accent</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="destructive-ghost">Destructive ghost</Button>
          <Button variant="link">Link</Button>
        </Row>
        <Row label="Sizes">
          <Button size="xs">xs</Button>
          <Button size="sm">sm</Button>
          <Button size="md">md</Button>
          <Button size="lg">lg</Button>
          <Button size="xl">xl</Button>
        </Row>
        <Row label="With icons">
          <Button leadingIcon={<Plus size={16} aria-hidden />}>Leading</Button>
          <Button trailingIcon={<ArrowRight size={16} aria-hidden />}>
            Trailing
          </Button>
          <Button iconOnly aria-label="Settings">
            <Settings size={16} aria-hidden />
          </Button>
          <Button loading>Saving...</Button>
          <Button disabled>Disabled</Button>
        </Row>
      </Section>

      <Section title="Inputs" description="Prototype form-input class, three sizes plus states.">
        <Row label="Text">
          <div className="form-group" style={{ flex: 1, minWidth: 220 }}>
            <label className="form-label">Full name</label>
            <Input placeholder="Jane Doe" />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: 220 }}>
            <label className="form-label">Email</label>
            <Input type="email" placeholder="jane@example.com" size="sm" />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: 220 }}>
            <label className="form-label">Rate per day</label>
            <Input type="number" defaultValue={850} size="lg" />
          </div>
        </Row>
        <Row label="States">
          <Input placeholder="Default" />
          <Input placeholder="Invalid" invalid defaultValue="bad@" />
          <Input placeholder="Disabled" disabled defaultValue="Locked" />
        </Row>
        <Row label="Select">
          <Select defaultValue="eng">
            <option value="eng">Engineering</option>
            <option value="ops">Operations</option>
            <option value="fin">Finance</option>
          </Select>
          <Select disabled defaultValue="eng">
            <option value="eng">Engineering</option>
          </Select>
        </Row>
        <Row label="Textarea">
          <Textarea
            placeholder="Describe the project..."
            style={{ minWidth: 320 }}
          />
        </Row>
        <Row label="Search">
          <div style={{ minWidth: 320 }}>
            <SearchInput placeholder="Search employees, clients, projects" />
          </div>
        </Row>
        <Row label="Checkbox">
          <Checkbox
            id="ck1"
            label="Email me weekly digests"
            checked={check}
            onChange={(e) => setCheck(e.target.checked)}
          />
          <Checkbox id="ck2" label="Enable 2FA" description="Required for admins" />
          <Checkbox id="ck3" disabled label="Disabled option" />
        </Row>
        <Row label="Radio">
          <Radio
            id="r1"
            name="freq"
            value="daily"
            label="Daily"
            checked={radio === "daily"}
            onChange={(e) => setRadio(e.target.value)}
          />
          <Radio
            id="r2"
            name="freq"
            value="weekly"
            label="Weekly"
            checked={radio === "weekly"}
            onChange={(e) => setRadio(e.target.value)}
          />
          <Radio
            id="r3"
            name="freq"
            value="monthly"
            label="Monthly"
            checked={radio === "monthly"}
            onChange={(e) => setRadio(e.target.value)}
          />
        </Row>
        <Row label="Toggle">
          <Toggle
            checked={toggleOn}
            onCheckedChange={setToggleOn}
            label="Kill switch"
          />
          <span className="text-2 text-sm">
            State: {toggleOn ? "on" : "off"}
          </span>
        </Row>
      </Section>

      <Section title="Badges and pills">
        <Row label="Tones">
          <Badge tone="primary">primary</Badge>
          <Badge tone="success">success</Badge>
          <Badge tone="warning">warning</Badge>
          <Badge tone="error">error</Badge>
          <Badge tone="info">info</Badge>
          <Badge tone="accent">accent</Badge>
          <Badge tone="gold">gold</Badge>
          <Badge tone="ghost">ghost</Badge>
          <Badge tone="default">default</Badge>
        </Row>
        <Row label="With icon">
          <Badge tone="success">
            <Check size={12} aria-hidden /> approved
          </Badge>
          <Badge tone="warning">
            <Bell size={12} aria-hidden /> 3 pending
          </Badge>
          <Badge tone="info">
            <Sparkles size={12} aria-hidden /> AI-suggested
          </Badge>
        </Row>
        <Row label="Pill alias">
          <Pill leading={<Sparkles size={12} aria-hidden />}>AI confidence: high</Pill>
          <Pill>Read only</Pill>
        </Row>
      </Section>

      <Section title="Avatars">
        <Row label="Sizes">
          <Avatar name="Sarah Chen" size="xs" />
          <Avatar name="Marcus Reyes" size="sm" />
          <Avatar name="Priya Patel" size="md" />
          <Avatar name="Elena Kovač" size="lg" />
          <Avatar name="Akira Suzuki" size="xl" />
          <Avatar name="Chidi Okafor" size="2xl" />
        </Row>
        <Row label="Presence">
          <Avatar name="Online user" status="online" />
          <Avatar name="Away user" status="away" />
          <Avatar name="Busy user" status="busy" />
          <Avatar name="Leave user" status="leave" />
        </Row>
        <Row label="Group">
          <AvatarGroup
            avatars={[
              { name: "Sarah Chen" },
              { name: "Marcus Reyes" },
              { name: "Priya Patel" },
              { name: "Elena Kovač" },
              { name: "Akira Suzuki" },
              { name: "Chidi Okafor" },
              { name: "Alice Wang" },
            ]}
            max={4}
          />
        </Row>
      </Section>

      <Section title="Stat cards" description="KPI strip from dashboards.">
        <div className="kpi-grid">
          <StatPill
            label="Revenue YTD"
            value="1.24M"
            delta="+12% vs last year"
            deltaDirection="up"
            accent="primary"
          />
          <StatPill
            label="Billable days"
            value="394"
            delta="this week"
            accent="accent"
          />
          <StatPill
            label="Approvals pending"
            value="12"
            delta="3 urgent"
            deltaDirection="down"
            accent="warning"
          />
          <StatPill
            label="Projects active"
            value="7"
            delta="+1 this month"
            deltaDirection="up"
            accent="gold"
          />
        </div>
      </Section>

      <Section title="Data table" description="Prototype .data-table wrapped in .data-table-wrapper.">
        <DataTableWrapper>
          <FilterBar
            embedded
            actions={
              <>
                <Button variant="ghost" size="sm" iconOnly aria-label="Filter">
                  <Filter size={16} aria-hidden />
                </Button>
                <SegControl
                  value={view}
                  onChange={(v) => setView(v)}
                  options={[
                    { value: "grid", label: "Grid view", icon: <LayoutGrid size={16} aria-hidden /> },
                    { value: "list", label: "List view", icon: <List size={16} aria-hidden /> },
                    { value: "org", label: "Org chart", icon: <Network size={16} aria-hidden /> },
                  ]}
                />
              </>
            }
          >
            <div style={{ flex: 1, minWidth: 220 }}>
              <SearchInput placeholder="Search..." />
            </div>
            <Select defaultValue="">
              <option value="">All departments</option>
              <option value="eng">Engineering</option>
              <option value="ops">Operations</option>
            </Select>
          </FilterBar>
          <Table>
            <THead>
              <TR>
                <TH>Employee</TH>
                <TH>Department</TH>
                <TH>Rate / day</TH>
                <TH>Status</TH>
                <TH style={{ width: 60 }}>Actions</TH>
              </TR>
            </THead>
            <TBody>
              {[
                { name: "Sarah Chen", dept: "Engineering", rate: "950", status: "Active" },
                { name: "Marcus Reyes", dept: "Operations", rate: "820", status: "Active" },
                { name: "Priya Patel", dept: "Finance", rate: "780", status: "On leave" },
                { name: "Alice Wang", dept: "Engineering", rate: "920", status: "Active" },
              ].map((row) => (
                <TR key={row.name}>
                  <TD>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--space-2)",
                      }}
                    >
                      <Avatar name={row.name} size="sm" />
                      <strong>{row.name}</strong>
                    </div>
                  </TD>
                  <TD>{row.dept}</TD>
                  <TD style={{ fontFamily: "var(--font-mono)" }}>EUR {row.rate}</TD>
                  <TD>
                    <Badge tone={row.status === "Active" ? "success" : "info"}>
                      {row.status}
                    </Badge>
                  </TD>
                  <TD>
                    <Dropdown
                      align="right"
                      trigger={({ toggle }) => (
                        <Button
                          variant="ghost"
                          size="sm"
                          iconOnly
                          aria-label="Row menu"
                          onClick={toggle}
                        >
                          <Settings size={14} aria-hidden />
                        </Button>
                      )}
                    >
                      <DropdownLabel>Row actions</DropdownLabel>
                      <DropdownItem icon={<Users size={14} aria-hidden />}>
                        View profile
                      </DropdownItem>
                      <DropdownItem icon={<Download size={14} aria-hidden />}>
                        Export CSV
                      </DropdownItem>
                      <DropdownDivider />
                      <DropdownItem destructive icon={<Trash2 size={14} aria-hidden />}>
                        Archive
                      </DropdownItem>
                    </Dropdown>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </DataTableWrapper>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Pagination page={page} pageCount={9} onChange={setPage} />
        </div>
      </Section>

      <Section title="Feedback" description="Modals, drawers, toasts, tooltips.">
        <Row label="Triggers">
          <Button onClick={() => setModalOpen(true)}>Open modal</Button>
          <Button
            variant="secondary"
            onClick={() => setDrawerOpen(true)}
          >
            Open drawer
          </Button>
          <Button
            variant="ghost"
            onClick={() =>
              toast.show({
                tone: "success",
                title: "Saved",
                description: "The design is coming back to life.",
              })
            }
          >
            Show toast
          </Button>
          <Button
            variant="ghost"
            onClick={() =>
              toast.show({
                tone: "error",
                title: "Could not save",
                description: "Check the field names.",
              })
            }
          >
            Error toast
          </Button>
          <Tooltip label="Keyboard shortcut: Cmd+K">
            <Button variant="ghost" size="sm" iconOnly aria-label="Search">
              <Search size={14} aria-hidden />
            </Button>
          </Tooltip>
        </Row>
      </Section>

      <Section title="Loaders and progress">
        <Row label="Spinner">
          <Spinner size="xs" />
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
        </Row>
        <Row label="Skeleton">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-2)",
              flex: 1,
            }}
          >
            <Skeleton variant="title" />
            <Skeleton variant="text" />
            <Skeleton variant="text" width="60%" />
          </div>
          <Skeleton variant="avatar" />
        </Row>
        <Row label="Progress">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-2)",
              flex: 1,
              minWidth: 260,
            }}
          >
            <ProgressBar value={20} label="20% upload" />
            <ProgressBar value={55} tone="gold" label="55%" />
            <ProgressBar value={80} tone="warning" label="80%" />
            <ProgressBar value={100} tone="error" label="100%" />
          </div>
        </Row>
      </Section>

      <Section title="Navigation">
        <Row label="Tabs">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="profile" count={12}>
                Profile
              </TabsTrigger>
              <TabsTrigger value="timesheets" count={4}>
                Timesheets
              </TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
            </TabsList>
            <TabsContent value="profile">
              <p className="text-2 text-sm">Profile tab content.</p>
            </TabsContent>
            <TabsContent value="timesheets">
              <p className="text-2 text-sm">Timesheets tab content.</p>
            </TabsContent>
            <TabsContent value="expenses">
              <p className="text-2 text-sm">Expenses tab content.</p>
            </TabsContent>
            <TabsContent value="billing">
              <p className="text-2 text-sm">Billing tab content.</p>
            </TabsContent>
          </Tabs>
        </Row>
        <Row label="Accordion">
          <div style={{ flex: 1 }}>
            <Accordion>
              <AccordionItem title="What does the AI do on month-end?" defaultOpen>
                It drafts every invoice on day 28, explains each line with
                source documents, and waits for your confirmation. You review
                and approve in bulk.
              </AccordionItem>
              <AccordionItem title="How is data kept isolated per tenant?">
                Each tenant has a dedicated Postgres schema. The request
                middleware sets search_path on every query.
              </AccordionItem>
              <AccordionItem title="Can I export everything?">
                Yes. GDPR-compliant exports cover employees, timesheets,
                expenses, and invoices as CSV + JSON.
              </AccordionItem>
            </Accordion>
          </div>
        </Row>
      </Section>

      <Section title="AI surfaces">
        <AIInsightCard
          title="Sarah Chen is at 47h/week for 3 weeks in a row"
          summary={
            <>
              <strong>Overwork risk detected.</strong> Consider redistributing
              the Acme Web Redesign tasks or extending the deadline. 4 similar
              cases last quarter led to one resignation.
            </>
          }
          evidence={[
            "Week 14: 48h logged, 40h planned",
            "Week 15: 47h logged, 40h planned",
            "Week 16: 46h logged, 40h planned",
          ]}
          actions={
            <>
              <Button variant="secondary" size="sm">
                Investigate
              </Button>
              <Button variant="ghost" size="sm">
                Dismiss
              </Button>
            </>
          }
        />
        <AIInvoiceExplanation
          severity="info"
          signals={["32 billable days", "EUR 775/day", "No discount"]}
          rationale="Invoice total of EUR 24,800 matches the 32 billable days logged by the Acme team in March, at the agreed EUR 775/day blended rate. No discount was applied per the master services agreement."
        />
        <AIInvoiceExplanation
          severity="warning"
          signals={["7 late entries", "Pending receipts"]}
          rationale="Acme's March hours include 7 entries submitted past the weekly cut-off. Confirm they belong to March before sending this draft to the client."
        />
        <AIInvoiceExplanation
          severity="action_needed"
          signals={["Missing rate", "Out of scope"]}
          rationale="Two project lines are missing agreed rates and one task is marked out-of-scope per the February amendment. Resolve before approval."
        />
      </Section>

      <Section title="Empty state">
        <EmptyState
          icon={Briefcase}
          title="No projects yet"
          description="Create your first project to start tracking time and planning resources. The AI will learn your billing patterns as you go."
          action={
            <Button leadingIcon={<Plus size={16} aria-hidden />}>
              New project
            </Button>
          }
        />
      </Section>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Confirm action"
        description="This will archive the selected employees. You can undo within 30 days."
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setModalOpen(false)}>
              Confirm
            </Button>
          </>
        }
      >
        <p className="text-2">
          Archiving is reversible but changes will not reflect in invoices
          until the next run. Proceed?
        </p>
      </Modal>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Details"
      >
        <p className="text-2">
          The drawer pattern is used for record details, notifications, and
          the AI command palette on mobile. Escape closes it.
        </p>
      </Drawer>
    </div>
  );
}
