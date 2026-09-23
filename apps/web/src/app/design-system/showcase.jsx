"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { SearchField } from "@/components/ui/search-field";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
function Section({ title, description, children }) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  );
}
function Row({ children }) {
  return <div className="flex flex-wrap items-center gap-3">{children}</div>;
}
export function DesignSystemShowcase() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12 space-y-16">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Design System</h1>
          <p className="text-lg text-muted-foreground">
            Reusable components and tokens for NoviLearn web and mobile apps.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <Tabs defaultValue="components">
        <TabsList className="mb-6">
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="tokens">Tokens</TabsTrigger>
          <TabsTrigger value="states">States</TabsTrigger>
        </TabsList>

        <TabsContent value="components" className="space-y-16">
          <Section title="Buttons" description="Primary actions and variants.">
            <Row>
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </Row>
            <Row>
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button disabled>Disabled</Button>
            </Row>
          </Section>

          <Separator />

          <Section
            title="Inputs"
            description="Text inputs, textareas, and labels."
          >
            <div className="grid gap-4 max-w-md">
              <Input label="Email" placeholder="you@example.com" type="email" />
              <Input
                label="With hint"
                placeholder="Type something..."
                hint="This is a hint"
              />
              <Input
                label="Error state"
                placeholder="Invalid"
                error="This field is required"
              />
              <div className="space-y-1.5">
                <Label>Textarea</Label>
                <Textarea placeholder="Write a message..." />
              </div>
              <SearchField placeholder="Search components..." />
            </div>
          </Section>

          <Separator />

          <Section title="Badges" description="Status indicators and labels.">
            <Row>
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="info">Info</Badge>
            </Row>
            <Row>
              <Badge size="sm">Small</Badge>
              <Badge size="default">Default</Badge>
              <Badge size="lg">Large</Badge>
            </Row>
          </Section>

          <Separator />

          <Section
            title="Cards"
            description="Content containers with optional sections."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Card Title</CardTitle>
                  <CardDescription>This is a card description.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Card content goes here. It can contain any elements.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button size="sm">Action</Button>
                </CardFooter>
              </Card>
              <Card className="bg-primary text-primary-foreground border-primary">
                <CardHeader>
                  <CardTitle>Highlighted Card</CardTitle>
                  <CardDescription className="text-primary-foreground/80">
                    A card with primary background.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Special content here.</p>
                </CardContent>
              </Card>
            </div>
          </Section>

          <Separator />

          <Section title="Alerts" description="Contextual feedback messages.">
            <div className="space-y-3 max-w-lg">
              <Alert>
                <AlertTitle>Default</AlertTitle>
                <AlertDescription>
                  This is a default alert message.
                </AlertDescription>
              </Alert>
              <Alert variant="success">
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  Your changes have been saved.
                </AlertDescription>
              </Alert>
              <Alert variant="warning">
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  Please review before continuing.
                </AlertDescription>
              </Alert>
              <Alert variant="info">
                <AlertTitle>Info</AlertTitle>
                <AlertDescription>
                  Here is some helpful information.
                </AlertDescription>
              </Alert>
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Something went wrong. Try again.
                </AlertDescription>
              </Alert>
            </div>
          </Section>

          <Separator />

          <Section
            title="Progress"
            description="Track completion or loading states."
          >
            <div className="space-y-4 max-w-lg">
              <Progress value={0} />
              <Progress value={25} />
              <Progress value={50} />
              <Progress value={75} />
              <Progress value={100} />
            </div>
          </Section>

          <Separator />

          <Section
            title="Accordion"
            description="Collapsible content sections."
          >
            <Accordion type="single" collapsible className="max-w-lg">
              <AccordionItem value="item-1">
                <AccordionTrigger>What is NoviLearn?</AccordionTrigger>
                <AccordionContent>
                  An AI-powered learning platform that personalizes your study
                  experience.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>How does it work?</AccordionTrigger>
                <AccordionContent>
                  It uses adaptive algorithms to tailor content to your learning
                  style and pace.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Is it free?</AccordionTrigger>
                <AccordionContent>
                  We offer a free tier with core features and premium plans for
                  advanced capabilities.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Section>

          <Separator />

          <Section
            title="Tabs"
            description="Organize content into tabbed panels."
          >
            <Tabs defaultValue="tab1" className="max-w-lg">
              <TabsList>
                <TabsTrigger value="tab1">Overview</TabsTrigger>
                <TabsTrigger value="tab2">Details</TabsTrigger>
                <TabsTrigger value="tab3">Settings</TabsTrigger>
              </TabsList>
              <TabsContent
                value="tab1"
                className="p-4 text-sm text-muted-foreground"
              >
                Overview content goes here.
              </TabsContent>
              <TabsContent
                value="tab2"
                className="p-4 text-sm text-muted-foreground"
              >
                Detailed information displayed here.
              </TabsContent>
              <TabsContent
                value="tab3"
                className="p-4 text-sm text-muted-foreground"
              >
                Settings and preferences.
              </TabsContent>
            </Tabs>
          </Section>

          <Separator />

          <Section
            title="Spinners & Skeletons"
            description="Loading indicators."
          >
            <Row>
              <Spinner size="sm" />
              <Spinner size="md" />
              <Spinner size="lg" />
            </Row>
            <div className="space-y-3 max-w-md">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-20 w-full" />
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="tokens" className="space-y-16">
          <Section title="Colors" description="Design token color palette.">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Primary</p>
                <Row>
                  <div
                    className="h-12 w-12 rounded bg-primary"
                    title="primary"
                  />
                  <div
                    className="h-12 w-12 rounded bg-primary-foreground"
                    title="primary-foreground"
                  />
                </Row>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Semantic</p>
                <Row>
                  <div
                    className="h-12 w-12 rounded bg-success"
                    title="success"
                  />
                  <div
                    className="h-12 w-12 rounded bg-warning"
                    title="warning"
                  />
                  <div className="h-12 w-12 rounded bg-info" title="info" />
                  <div
                    className="h-12 w-12 rounded bg-destructive"
                    title="destructive"
                  />
                </Row>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Neutral</p>
                <Row>
                  <div
                    className="h-12 w-12 rounded bg-background border"
                    title="background"
                  />
                  <div
                    className="h-12 w-12 rounded bg-foreground"
                    title="foreground"
                  />
                  <div className="h-12 w-12 rounded bg-muted" title="muted" />
                  <div
                    className="h-12 w-12 rounded bg-muted-foreground"
                    title="muted-foreground"
                  />
                  <div className="h-12 w-12 rounded bg-border" title="border" />
                  <div className="h-12 w-12 rounded bg-ring" title="ring" />
                </Row>
              </div>
            </div>
          </Section>

          <Separator />

          <Section title="Typography" description="Font families and sizes.">
            <div className="space-y-3">
              <p className="text-4xl font-bold">Heading 1 (4xl bold)</p>
              <p className="text-3xl font-bold">Heading 2 (3xl bold)</p>
              <p className="text-2xl font-semibold">Heading 3 (2xl semibold)</p>
              <p className="text-xl font-semibold">Heading 4 (xl semibold)</p>
              <p className="text-lg font-medium">Heading 5 (lg medium)</p>
              <p className="text-base">Body text (base)</p>
              <p className="text-sm text-muted-foreground">
                Small / muted (sm)
              </p>
              <p className="text-xs text-muted-foreground">Caption (xs)</p>
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="states" className="space-y-16">
          <Section
            title="Empty State"
            description="When there is no data to display."
          >
            <EmptyState
              title="No courses yet"
              description="Start by creating your first course to begin learning."
              action={<Button size="sm">Create Course</Button>}
            />
          </Section>

          <Separator />

          <Section title="Error State" description="When something goes wrong.">
            <ErrorState
              title="Failed to load"
              description="There was an error loading your data. Please try again."
              action={
                <Button size="sm" variant="outline">
                  Retry
                </Button>
              }
            />
          </Section>

          <Separator />

          <Section
            title="Loading State"
            description="While data is being fetched."
          >
            <LoadingState message="Loading your courses..." />
          </Section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
