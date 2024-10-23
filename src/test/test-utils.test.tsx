import { screen } from '@testing-library/react'
import { vi, expect, describe, test } from 'vitest'
import * as testUtils from './test-utils'

// Mock the entire @testing-library/react module
vi.mock('@testing-library/react', async () => {
    const actual = (await vi.importActual('@testing-library/react')) as typeof import('@testing-library/react')
    return {
        ...actual,
        render: vi.fn().mockImplementation((ui, options) => {
            return {
                ...actual.render(ui, options),
                rerender: vi.fn(),
                unmount: vi.fn(),
            }
        }),
    }
})

describe('test-utils', () => {
    test('AllTheProviders renders children without modification', () => {
        const TestComponent = () => <div>Test Component</div>
        testUtils.render(<TestComponent />)

        expect(screen.getByText('Test Component')).toBeInTheDocument()
    })

    test('customRender function wraps component with AllTheProviders', () => {
        const TestComponent = () => <div>Wrapped Component</div>
        testUtils.render(<TestComponent />)

        expect(screen.getByText('Wrapped Component')).toBeInTheDocument()
    })

    test('customRender function passes additional options to render', () => {
        const TestComponent = () => <div>Test Component</div>
        const customOption = { container: document.createElement('div') }
        const result = testUtils.render(<TestComponent />, customOption)

        expect(result.container).toBe(customOption.container)
    })

    test('customRender function returns the result of rtlRender', () => {
        const TestComponent = () => <div>Test Component</div>
        const result = testUtils.render(<TestComponent />)

        expect(result).toHaveProperty('rerender')
        expect(result).toHaveProperty('unmount')
        expect(result).toHaveProperty('container')
    })

    test('exports from @testing-library/react are re-exported', () => {
        expect(testUtils.render).toBeDefined()
        expect(testUtils.screen).toBeDefined()
        // Add more assertions for other exports if needed
    })
})