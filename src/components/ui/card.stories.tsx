import { Button } from '@components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@components/ui/card';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CoinsIcon, MoreHorizontalIcon } from 'lucide-react';

const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A surface that groups related content. The variant sets the tone: ' +
          '`default` through `sunk` walk the elevation scale for the SaaS ' +
          'shell, while `brand`, `felt` and `chip` are the expressive ones ' +
          'reserved for the table view and marketing blocks.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'muted',
        'sunk',
        'elevated',
        'gradient',
        'brand',
        'glass',
        'felt',
        'chip',
      ],
    },
    size: { control: 'select', options: ['default', 'sm', 'lg'] },
    rim: {
      control: 'select',
      options: [1, 5, 10, 25, 50, 100, 500, '1k', 'felt'],
      description: 'Chip denomination. Only applies to the `chip` variant.',
    },
    interactive: { control: 'boolean' },
  },
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Fills a card with a representative header / content / footer set. */
const sample: NonNullable<Story['render']> = function Render(args) {
  return (
    <Card {...args} className="w-80">
      <CardHeader>
        <CardTitle>Vendredi soir</CardTitle>
        <CardDescription>4 joueurs · cave de 100 jetons</CardDescription>
        <CardAction>
          <Button variant="ghost" size="icon-sm" aria-label="Options">
            <MoreHorizontalIcon />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        La partie est prête. Distribue les caves et projette la table sur la TV.
      </CardContent>
      <CardFooter>
        <Button size="sm">
          <CoinsIcon data-icon="inline-start" />
          Lancer
        </Button>
      </CardFooter>
    </Card>
  );
};

/** The workhorse: a bordered panel on the page background. */
export const Default: Story = { args: { variant: 'default' }, render: sample };

/** One step up the elevation scale — for a card nested inside another. */
export const Muted: Story = { args: { variant: 'muted' }, render: sample };

/** Recessed well, for read-only blocks and inputs inside a panel. */
export const Sunk: Story = { args: { variant: 'sunk' }, render: sample };

/** Borderless, leaning on shadow alone to separate from the background. */
export const Elevated: Story = {
  args: { variant: 'elevated' },
  render: sample,
};

/**
 * Brand-tinted diagonal wash with a coral bloom in the corner. Showcase and
 * marketing blocks only — the tint costs contrast in dense UI.
 */
export const Gradient: Story = {
  args: { variant: 'gradient' },
  render: sample,
};

/** Full-bleed coral → plum gradient. Carries its own light foreground. */
export const Brand: Story = { args: { variant: 'brand' }, render: sample };

/**
 * Translucent and blurred, for panels over imagery. Falls back to a solid card
 * where `backdrop-filter` is unsupported.
 */
export const Glass: Story = {
  args: { variant: 'glass' },
  render: sample,
  decorators: [
    (Story) => (
      <div className="from-coral-500 via-coral-deep to-plum-600 rounded-xl bg-linear-120 p-8">
        <Story />
      </div>
    ),
  ],
};

/** The table-view panel: sits on the felt and reads at TV distance. */
export const Felt: Story = {
  args: { variant: 'felt' },
  render: sample,
  decorators: [
    (Story) => (
      <div className="rounded-xl bg-radial-[ellipse_at_50%_20%] from-teal-600 to-teal-800 p-8">
        <Story />
      </div>
    ),
  ],
};

/**
 * The signature variant: a poker-chip rim, notches and all. `rim` picks the
 * denomination color — use it to tie a card to a chip value.
 */
export const Chip: Story = {
  args: { variant: 'chip', rim: 5 },
  render: sample,
};

/** Every denomination the `rim` prop accepts. */
export const ChipRims: Story = {
  args: { variant: 'chip' },
  render: function Render(args) {
    const rims = [1, 5, 10, 25, 50, 100, 500, '1k'] as const;

    return (
      <div className="grid grid-cols-4 gap-6 p-2">
        {rims.map((rim) => (
          <Card key={rim} {...args} rim={rim} size="sm" className="w-40">
            <CardHeader>
              <CardTitle>${rim}</CardTitle>
              <CardDescription>Jeton</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  },
};

/** The three sizes, which scale padding, gap, radius and title together. */
export const Sizes: Story = {
  args: {},
  render: function Render(args) {
    const sizes = ['sm', 'default', 'lg'] as const;

    return (
      <div className="flex flex-wrap items-start gap-4">
        {sizes.map((size) => (
          <Card key={size} {...args} size={size} className="w-64">
            <CardHeader>
              <CardTitle>Taille {size}</CardTitle>
              <CardDescription>Padding, gap et titre suivent.</CardDescription>
            </CardHeader>
            <CardContent>Cave de 100 jetons.</CardContent>
          </Card>
        ))}
      </div>
    );
  },
};

/** Lifts on hover — for cards that are themselves links or buttons. */
export const Interactive: Story = {
  args: { interactive: true },
  render: sample,
};
