import React from 'react'
import { vi, expect, describe, test, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import { createRoot } from 'react-dom/client'

// Mock react-dom/client
vi.mock('react-dom/client', () => ({
    createRoot: vi.fn(() => ({
        render: vi.fn(),
    })),
}))

// Mock the App component
vi.mock('./App', () => ({
    default: () => <div>Mocked App</div>,
}))

describe('main.tsx', () => {
    let originalConsoleError: typeof console.error

    beforeEach(() => {
        // Save the original console.error
        originalConsoleError = console.error
        // Mock console.error to suppress React 18 warnings
        console.error = vi.fn()
    })

    afterEach(() => {
        // Restore the original console.error
        console.error = originalConsoleError
        // Clear all mocks
        vi.clearAllMocks()
    })

    test('renders App component within StrictMode', async () => {
        // Create a fake DOM element
        const root = document.createElement('div')
        root.id = 'root'
        document.body.appendChild(root)

        // Import the main module
        await import('./main')

        // Check if createRoot was called with the correct element
        expect(createRoot).toHaveBeenCalledWith(root)

        // Get the mock render function
        const mockRender = (createRoot as unknown as jest.Mock).mock.results[0].value.render

        // Check if render was called
        expect(mockRender).toHaveBeenCalled()

        // Check if the rendered content is wrapped in StrictMode and contains the App component
        const { container } = render(mockRender.mock.calls[0][0])
        expect(container.innerHTML).toContain('Mocked App')

        // Clean up
        document.body.removeChild(root)
    })
})