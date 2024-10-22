import '@testing-library/jest-dom'
// import { vi } from 'vitest'


// // Mock CSS modules
// vi.mock('*.css', () => ({}))

// // Mock shadcn/ui components
// vi.mock('@/components/ui/button', () => ({
//   Button: vi.fn(({ children, ...props }) => ({
//     type: 'button',
//     props: { ...props, children },
//   })),
// }))

// vi.mock('@/components/ui/input', () => ({
//   Input: vi.fn(({ ...props }) => ({
//     type: 'input',
//     props: { ...props },
//   })),
// }))

// vi.mock('@/components/ui/label', () => ({
//   Label: vi.fn(({ children, ...props }) => ({
//     type: 'label',
//     props: { ...props, children },
//   })),
// }))

// vi.mock('@/components/ui/select', () => ({
//   Select: vi.fn(({ children, ...props }) => ({
//     type: 'select',
//     props: { ...props, children },
//   })),
//   SelectTrigger: vi.fn(({ children, ...props }) => ({
//     type: 'div',
//     props: { ...props, children },
//   })),
//   SelectValue: vi.fn(({ children, ...props }) => ({
//     type: 'span',
//     props: { ...props, children },
//   })),
//   SelectContent: vi.fn(({ children, ...props }) => ({
//     type: 'div',
//     props: { ...props, children },
//   })),
//   SelectItem: vi.fn(({ children, ...props }) => ({
//     type: 'div',
//     props: { ...props, children },
//   })),
// }))

// vi.mock('@/components/ui/accordion', () => ({
//   Accordion: vi.fn(({ children, ...props }) => ({
//     type: 'div',
//     props: { ...props, children },
//   })),
//   AccordionItem: vi.fn(({ children, ...props }) => ({
//     type: 'div',
//     props: { ...props, children },
//   })),
//   AccordionTrigger: vi.fn(({ children, ...props }) => ({
//     type: 'button',
//     props: { ...props, children },
//   })),
//   AccordionContent: vi.fn(({ children, ...props }) => ({
//     type: 'div',
//     props: { ...props, children },
//   })),
// }))

// vi.mock('@/components/ui/calendar', () => ({
//   Calendar: vi.fn(({ ...props }) => ({
//     type: 'div',
//     props: { ...props, children: 'Calendar Mock' },
//   })),
// }))

// vi.mock('@/components/ui/popover', () => ({
//   Popover: vi.fn(({ children, ...props }) => ({
//     type: 'div',
//     props: { ...props, children },
//   })),
//   PopoverTrigger: vi.fn(({ children, ...props }) => ({
//     type: 'button',
//     props: { ...props, children },
//   })),
//   PopoverContent: vi.fn(({ children, ...props }) => ({
//     type: 'div',
//     props: { ...props, children },
//   })),
// }))

// // Mock date-fns
// vi.mock('date-fns', () => ({
//   format: vi.fn((date, format) => `Formatted: ${date.toISOString()}`),
//   parse: vi.fn((dateString) => new Date(dateString)),
//   addDays: vi.fn((date, amount) => {
//     const result = new Date(date)
//     result.setDate(result.getDate() + amount)
//     return result
//   }),
//   // Add more date-fns function mocks as needed
// }))

// // Mock lucide-react icons
// vi.mock('lucide-react', () => ({
//   Calendar: vi.fn(() => ({
//     type: 'span',
//     props: { children: 'Calendar Icon' },
//   })),
//   ChevronLeft: vi.fn(() => ({
//     type: 'span',
//     props: { children: 'ChevronLeft Icon' },
//   })),
//   ChevronRight: vi.fn(() => ({
//     type: 'span',
//     props: { children: 'ChevronRight Icon' },
//   })),
//   CalendarIcon: vi.fn(() => ({
//     type: 'span',
//     props: { children: 'Calendar Icon' },
//   })),
//   Upload: vi.fn(() => ({
//     type: 'span',
//     props: { children: 'Upload Icon' },
//   })),
//   // Add any other icons used in your component
// }))