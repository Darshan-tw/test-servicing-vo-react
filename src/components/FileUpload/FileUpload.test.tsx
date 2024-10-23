import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import FileUpload from './FileUpload'

describe('FileUpload', () => {
    const mockOnFileUpload = vi.fn()
    const mockOnFileDelete = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders file input', () => {
        render(<FileUpload onFileUpload={mockOnFileUpload} onFileDelete={mockOnFileDelete} uploadedFiles={[]} />)
        expect(screen.getByTestId('fileUpload')).toBeInTheDocument()
    })

    it('calls onFileUpload when files are selected', () => {
        render(<FileUpload onFileUpload={mockOnFileUpload} onFileDelete={mockOnFileDelete} uploadedFiles={[]} />)
        const input = screen.getByTestId('fileUpload')
        const file = new File(['hello'], 'hello.png', { type: 'image/png' })
        fireEvent.change(input, { target: { files: [file] } })
        expect(mockOnFileUpload).toHaveBeenCalledWith([file])
    })

    it('displays error for invalid file type', () => {
        render(<FileUpload onFileUpload={mockOnFileUpload} onFileDelete={mockOnFileDelete} acceptedFileTypes={['.pdf']} uploadedFiles={[]} />)
        const input = screen.getByTestId('fileUpload')
        const file = new File(['hello'], 'hello.png', { type: 'image/png' })
        fireEvent.change(input, { target: { files: [file] } })
        expect(screen.getByText('File hello.png is not an accepted file type.')).toBeInTheDocument()
    })

    it('displays error for file size exceeding limit', () => {
        render(<FileUpload onFileUpload={mockOnFileUpload} onFileDelete={mockOnFileDelete} maxFileSize={1} uploadedFiles={[]} />)
        const input = screen.getByTestId('fileUpload')
        const file = new File(['a'.repeat(2 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' })
        fireEvent.change(input, { target: { files: [file] } })
        expect(screen.getByText('File large.pdf is too large. Maximum size is 1MB.')).toBeInTheDocument()
    })

    it('displays uploaded files', () => {
        const uploadedFiles = [
            new File(['hello'], 'hello.png', { type: 'image/png' }),
            new File(['world'], 'world.pdf', { type: 'application/pdf' })
        ]
        render(<FileUpload onFileUpload={mockOnFileUpload} onFileDelete={mockOnFileDelete} uploadedFiles={uploadedFiles} />)
        expect(screen.getByText('hello.png')).toBeInTheDocument()
        expect(screen.getByText('world.pdf')).toBeInTheDocument()
    })

    it('calls onFileDelete when delete button is clicked', () => {
        const uploadedFiles = [new File(['hello'], 'hello.png', { type: 'image/png' })]
        render(<FileUpload onFileUpload={mockOnFileUpload} onFileDelete={mockOnFileDelete} uploadedFiles={uploadedFiles} />)
        const deleteButton = screen.getByRole('button', { name: /delete/i })
        fireEvent.click(deleteButton)
        expect(mockOnFileDelete).toHaveBeenCalledWith(0)
    })

    it('accepts multiple file uploads', () => {
        render(<FileUpload onFileUpload={mockOnFileUpload} onFileDelete={mockOnFileDelete} uploadedFiles={[]} />)
        const input = screen.getByTestId('fileUpload')
        const file1 = new File(['hello'], 'hello.png', { type: 'image/png' })
        const file2 = new File(['world'], 'world.pdf', { type: 'application/pdf' })
        fireEvent.change(input, { target: { files: [file1, file2] } })
        expect(mockOnFileUpload).toHaveBeenCalledWith([file1, file2])
    })

    it('renders with custom maxFileSize and acceptedFileTypes', () => {
        const customMaxFileSize = 50
        const customAcceptedFileTypes = ['.doc', '.docx']
        render(
            <FileUpload
                onFileUpload={mockOnFileUpload}
                onFileDelete={mockOnFileDelete}
                uploadedFiles={[]}
                maxFileSize={customMaxFileSize}
                acceptedFileTypes={customAcceptedFileTypes}
            />
        )
        const input = screen.getByTestId('fileUpload')
        expect(input).toHaveAttribute('accept', '.doc,.docx')
    })
})