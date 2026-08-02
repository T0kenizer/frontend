import { Button } from '@components/ui/button';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import {
  ArrowRightIcon,
  ChevronDownIcon,
  CoinsIcon,
  ExternalLinkIcon,
  LogInIcon,
  MenuIcon,
  PlayIcon,
  PlusIcon,
  SettingsIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react';

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

/**
 * Renders a variant twice, text-only then with a leading icon, so the pair can
 * be compared at a glance. `args` still drives both, so the controls apply.
 */
const withAndWithoutIcon = (
  icon: React.ReactNode,
  label: React.ReactNode,
): NonNullable<Story['render']> =>
  function Render(args) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <Button {...args}>{label}</Button>
        <Button {...args}>
          {icon}
          {label}
        </Button>
      </div>
    );
  };

export const Primary: Story = {
  args: { variant: 'primary', children: 'New game' },
  render: withAndWithoutIcon(<PlusIcon data-icon="inline-start" />, 'New game'),
};

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Join' },
  render: withAndWithoutIcon(<LogInIcon data-icon="inline-start" />, 'Join'),
};

export const Ghost: Story = {
  args: { variant: 'ghost', children: 'Cancel' },
  render: withAndWithoutIcon(<XIcon data-icon="inline-start" />, 'Cancel'),
};

export const Destructive: Story = {
  args: { variant: 'destructive', children: 'Delete game' },
  render: withAndWithoutIcon(
    <Trash2Icon data-icon="inline-start" />,
    'Delete game',
  ),
};

/**
 * Solid red (the spec's `.btn-danger`): destructive or risky actions, to be
 * used sparingly. `destructive` is the tinted version of it.
 */
export const Danger: Story = {
  args: { variant: 'danger', children: 'Fold' },
  render: withAndWithoutIcon(<XIcon data-icon="inline-start" />, 'Fold'),
};

export const Outline: Story = {
  args: { variant: 'outline', children: 'Settings' },
  render: withAndWithoutIcon(
    <SettingsIcon data-icon="inline-start" />,
    'Settings',
  ),
};

/**
 * The trailing icon (`data-icon="inline-end"`) is the exception to the icon →
 * text order: it marks navigation away rather than the action itself.
 */
export const Link: Story = {
  args: { variant: 'link', children: 'View the rules' },
  render: function Render(args) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <Button {...args}>View the rules</Button>
        <Button {...args}>
          View the rules
          <ExternalLinkIcon data-icon="inline-end" />
        </Button>
      </div>
    );
  },
};

/** Reserved for the table view: felt green, deep shadow like a placed chip. */
export const Felt: Story = {
  args: { variant: 'felt', children: 'Bet $25' },
  render: withAndWithoutIcon(<CoinsIcon data-icon="inline-start" />, 'Bet $25'),
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

/**
 * The inverse of `felt`, the way `inverse` is to `primary`: a light button on
 * the table, for a key action that has to outrank the surrounding felt ones.
 */
export const FeltInverse: Story = {
  args: { variant: 'felt-inverse', children: 'All in' },
  render: withAndWithoutIcon(<CoinsIcon data-icon="inline-start" />, 'All in'),
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
  render: withAndWithoutIcon(
    <LogInIcon data-icon="inline-start" />,
    'Join with a code',
  ),
  decorators: [
    (Story) => (
      <div className="from-coral-500 via-coral-deep to-plum-600 rounded-xl bg-linear-120 p-8">
        <Story />
      </div>
    ),
  ],
};

/**
 * Every variant, text-only in the first column and with its icon in the second,
 * in the active theme. The contextual ones are shown on the background they are
 * meant for: `felt` and `felt-inverse` on the table, `line` and `inverse` on a
 * hero gradient.
 */
export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-[auto_auto] justify-start gap-3">
        <Button variant="primary">Primary</Button>
        <Button variant="primary">
          <PlusIcon data-icon="inline-start" />
          Primary
        </Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="secondary">
          <LogInIcon data-icon="inline-start" />
          Secondary
        </Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="ghost">
          <XIcon data-icon="inline-start" />
          Ghost
        </Button>
        <Button variant="outline">Outline</Button>
        <Button variant="outline">
          <SettingsIcon data-icon="inline-start" />
          Outline
        </Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="destructive">
          <Trash2Icon data-icon="inline-start" />
          Destructive
        </Button>
        <Button variant="danger">Danger</Button>
        <Button variant="danger">
          <XIcon data-icon="inline-start" />
          Danger
        </Button>
        <Button variant="link">Link</Button>
        <Button variant="link">
          Link
          <ExternalLinkIcon data-icon="inline-end" />
        </Button>
      </div>
      <div className="grid grid-cols-[auto_auto] justify-start gap-3 rounded-xl bg-radial-[ellipse_at_50%_20%] from-teal-600 to-teal-800 p-6">
        <Button variant="felt">Felt</Button>
        <Button variant="felt">
          <CoinsIcon data-icon="inline-start" />
          Felt
        </Button>
        <Button variant="felt-inverse">Felt inverse</Button>
        <Button variant="felt-inverse">
          <CoinsIcon data-icon="inline-start" />
          Felt inverse
        </Button>
      </div>
      <div className="from-coral-500 via-coral-deep to-plum-600 grid grid-cols-[auto_auto] justify-start gap-3 rounded-xl bg-linear-120 p-6">
        <Button variant="line">Line</Button>
        <Button variant="line">
          <LogInIcon data-icon="inline-start" />
          Line
        </Button>
        <Button variant="inverse">Inverse</Button>
        <Button variant="inverse">
          Inverse
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
      </div>
    </div>
  ),
};

/**
 * The icon scales with the size (`size-3` at `xs`, `size-4` at `default`), and
 * the padding tightens on the side it sits on.
 */
export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <Button size="xs">Extra small</Button>
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button size="xs">
          <PlusIcon data-icon="inline-start" />
          Extra small
        </Button>
        <Button size="sm">
          <PlusIcon data-icon="inline-start" />
          Small
        </Button>
        <Button size="default">
          <PlusIcon data-icon="inline-start" />
          Default
        </Button>
        <Button size="lg">
          <PlusIcon data-icon="inline-start" />
          Large
        </Button>
      </div>
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

/**
 * The icon → text order is always respected. Mark the icon with
 * `data-icon="inline-start"` or `"inline-end"` so the size variants can tighten
 * the padding on that side; a trailing chevron is the dropdown convention.
 */
export const WithIcon: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button>New game</Button>
      <Button>
        <PlusIcon data-icon="inline-start" />
        New game
      </Button>
      <Button variant="secondary">
        Continue
        <ArrowRightIcon data-icon="inline-end" />
      </Button>
      <Button variant="secondary" aria-haspopup="menu" aria-expanded={false}>
        Blinds
        <ChevronDownIcon data-icon="inline-end" />
      </Button>
    </div>
  ),
};

/**
 * The spinner is appended to the content: the label and the leading icon both
 * stay visible, and the button widens to make room for it.
 */
export const Loading: Story = {
  args: { loading: true, children: 'Creating…' },
  render: withAndWithoutIcon(
    <PlusIcon data-icon="inline-start" />,
    'Creating…',
  ),
};

export const Disabled: Story = {
  args: { disabled: true, children: 'Unavailable' },
  render: withAndWithoutIcon(
    <PlusIcon data-icon="inline-start" />,
    'Unavailable',
  ),
};

/** `aria-invalid` shows the error ring, for an inline submission failure. */
export const Invalid: Story = {
  args: { 'aria-invalid': true, children: 'Try again' },
  render: withAndWithoutIcon(
    <PlusIcon data-icon="inline-start" />,
    'Try again',
  ),
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
      <Button className="w-full">
        <PlusIcon data-icon="inline-start" />
        Create an account
      </Button>
      <Button variant="secondary" className="w-full">
        Sign in
      </Button>
      <Button variant="secondary" className="w-full">
        <LogInIcon data-icon="inline-start" />
        Sign in
      </Button>
    </div>
  ),
};
