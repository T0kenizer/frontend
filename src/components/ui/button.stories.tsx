import { Button } from '@components/ui/button';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { MenuIcon, PlayIcon, PlusIcon, SettingsIcon } from 'lucide-react';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'The primary action of the Tokenizer design system. A variant ' +
          'conveys importance and context: `felt` is reserved for the table ' +
          'view, and `line` for colored backgrounds.',
      },
    },
  },
  tags: ['autodocs'],
  args: {
    children: 'New game',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'primary',
        'secondary',
        'ghost',
        'outline',
        'destructive',
        'danger',
        'inverse',
        'link',
        'felt',
        'felt-inverse',
        'line',
      ],
    },
    size: {
      control: 'select',
      options: [
        'default',
        'xs',
        'sm',
        'lg',
        'icon',
        'icon-xs',
        'icon-sm',
        'icon-lg',
      ],
    },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    asChild: { table: { disable: true } },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { variant: 'primary' },
};

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Join' },
};

export const Ghost: Story = {
  args: { variant: 'ghost', children: 'Cancel' },
};

export const Destructive: Story = {
  args: { variant: 'destructive', children: 'Delete game' },
};

/** Solid red (the spec's `.btn-danger`): destructive or risky actions, to be
 *  used sparingly. `destructive` is the tinted version of it. */
export const Danger: Story = {
  args: { variant: 'danger', children: 'Fold' },
};

/** Reserved for the table view: felt green, deep shadow like a placed chip. */
export const Felt: Story = {
  args: { variant: 'felt', children: 'Bet $25' },
  parameters: {
    backgrounds: { default: 'felt' },
  },
  decorators: [
    (Story) => (
      <div className="rounded-xl bg-radial-[ellipse_at_50%_20%] from-teal-600 to-teal-800 p-8">
        <Story />
      </div>
    ),
  ],
};

/** The inverse of `felt`, the way `inverse` is to `primary`: a light button on
 *  the table, for a key action that has to outrank the surrounding felt ones. */
export const FeltInverse: Story = {
  args: { variant: 'felt-inverse', children: 'All in' },
  parameters: {
    backgrounds: { default: 'felt' },
  },
  decorators: [
    (Story) => (
      <div className="rounded-xl bg-radial-[ellipse_at_50%_20%] from-teal-600 to-teal-800 p-8">
        <Story />
      </div>
    ),
  ],
};

/** For colored backgrounds (hero): translucent white + light border. */
export const Line: Story = {
  args: { variant: 'line', children: 'Join with a code' },
  decorators: [
    (Story) => (
      <div className="from-coral-500 via-coral-deep to-plum-600 rounded-xl bg-linear-120 p-8">
        <Story />
      </div>
    ),
  ],
};

/** Every variant side by side, in the active theme. The contextual ones are
 *  shown on the background they are meant for: `felt` and `felt-inverse` on the
 *  table, `line` and `inverse` on a hero gradient. */
export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="danger">Danger</Button>
        <Button variant="link">Link</Button>
      </div>
      <div className="flex flex-wrap items-center gap-3 rounded-xl bg-radial-[ellipse_at_50%_20%] from-teal-600 to-teal-800 p-6">
        <Button variant="felt">Felt</Button>
        <Button variant="felt-inverse">Felt inverse</Button>
      </div>
      <div className="from-coral-500 via-coral-deep to-plum-600 flex flex-wrap items-center gap-3 rounded-xl bg-linear-120 p-6">
        <Button variant="line">Line</Button>
        <Button variant="inverse">Inverse</Button>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="xs">Extra small</Button>
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

/** Icon-only buttons require an `aria-label`. */
export const IconOnly: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="icon-xs" variant="secondary" aria-label="Settings">
        <SettingsIcon />
      </Button>
      <Button size="icon-sm" variant="secondary" aria-label="Menu">
        <MenuIcon />
      </Button>
      <Button size="icon" aria-label="Add">
        <PlusIcon />
      </Button>
      <Button size="icon-lg" aria-label="Play">
        <PlayIcon />
      </Button>
    </div>
  ),
};

/** The icon → text order is always respected. */
export const WithIcon: Story = {
  args: {
    children: (
      <>
        <PlusIcon />
        New game
      </>
    ),
  },
};

/** The spinner replaces the content, and the button width is preserved. */
export const Loading: Story = {
  args: { loading: true, children: 'Creating…' },
};

export const Disabled: Story = {
  args: { disabled: true, children: 'Unavailable' },
};

/** `aria-invalid` shows the error ring, for an inline submission failure. */
export const Invalid: Story = {
  args: { 'aria-invalid': true, children: 'Try again' },
};

/** Every state, on the primary and secondary variants. */
export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      <Button>Idle</Button>
      <Button variant="secondary">Idle</Button>
      <Button loading>Creating…</Button>
      <Button variant="secondary" loading>
        Loading
      </Button>
      <Button disabled>Unavailable</Button>
      <Button variant="secondary" disabled>
        Unavailable
      </Button>
      <Button aria-invalid>Try again</Button>
      <Button variant="secondary" aria-invalid>
        Invalid code
      </Button>
    </div>
  ),
};

/** Full width, for sidebars and cards. */
export const FullWidth: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-80 flex-col gap-3">
      <Button className="w-full">Create an account</Button>
      <Button variant="secondary" className="w-full">
        Sign in
      </Button>
    </div>
  ),
};
