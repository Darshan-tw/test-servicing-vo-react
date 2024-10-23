import {render, screen, fireEvent} from '@testing-library/react'
import { vi } from 'vitest'
import MemberDetailsForm from './MemberDetailsForm'

describe('MemberDetailsForm', () => {
    const mockMemberDetails = {
        memberNumber: 'MEM001',
        title: 'Mr',
        name: 'John Doe',
        gender: 'Male',
        dateOfBirth: '1990-01-01',
        address: '123 Main St, City, Country',
        phoneNumber: '1234567890',
        email: 'john@example.com',
    }

    const mockOnInputChange = vi.fn()
    const mockOnSelectChange = vi.fn()
    const mockOnDateChange = vi.fn()

    it('renders all form fields', () => {
        render(
            <MemberDetailsForm
                memberDetails={mockMemberDetails}
                onInputChange={mockOnInputChange}
                onSelectChange={mockOnSelectChange}
                onDateChange={mockOnDateChange}
            />
        )

        expect(screen.getByText('Title')).toBeInTheDocument()
        expect(screen.getByLabelText('Name')).toBeInTheDocument()
        expect(screen.getByText('Gender')).toBeInTheDocument()
        expect(screen.getByText('Date of Birth')).toBeInTheDocument()
        expect(screen.getByLabelText('Address')).toBeInTheDocument()
        expect(screen.getByLabelText('Contact Number')).toBeInTheDocument()
        expect(screen.getByLabelText('Email')).toBeInTheDocument()
    })

    it('calls onSelectChange when title is changed', () => {
        render(
            <MemberDetailsForm
                memberDetails={mockMemberDetails}
                onInputChange={mockOnInputChange}
                onSelectChange={mockOnSelectChange}
                onDateChange={mockOnDateChange}
            />
        )

        const titleSelect = screen.getByTestId('gender')
        fireEvent.click(titleSelect)
        fireEvent.click(screen.getByText('Ms'))

        expect(mockOnSelectChange).toHaveBeenCalledWith('title', 'Ms')
    })

    it('calls onSelectChange when gender is changed', () => {
        render(
            <MemberDetailsForm
                memberDetails={mockMemberDetails}
                onInputChange={mockOnInputChange}
                onSelectChange={mockOnSelectChange}
                onDateChange={mockOnDateChange}
            />
        )

        const genderSelect = screen.getByTestId('gender-select')
        fireEvent.click(genderSelect)
        fireEvent.click(screen.getByText('Female'))

        expect(mockOnSelectChange).toHaveBeenCalledWith('gender', 'Female')
    })

    it('calls onInputChange when phone number is changed', () => {
        render(
            <MemberDetailsForm
                memberDetails={mockMemberDetails}
                onInputChange={mockOnInputChange}
                onSelectChange={mockOnSelectChange}
                onDateChange={mockOnDateChange}
            />
        )

        const phoneInput = screen.getByLabelText('Contact Number')
        fireEvent.change(phoneInput, { target: { value: '9876543210' } })

        expect(mockOnInputChange).toHaveBeenCalled()
    })

    it('calls onInputChange when email is changed', () => {
        render(
            <MemberDetailsForm
                memberDetails={mockMemberDetails}
                onInputChange={mockOnInputChange}
                onSelectChange={mockOnSelectChange}
                onDateChange={mockOnDateChange}
            />
        )

        const emailInput = screen.getByLabelText('Email')
        fireEvent.change(emailInput, { target: { value: 'newemail@example.com' } })

        expect(mockOnInputChange).toHaveBeenCalled()
    })

    // it('calls onDateChange when date of birth is changed', async () => {
    //     render(
    //         <MemberDetailsForm
    //             memberDetails={mockMemberDetails}
    //             onInputChange={mockOnInputChange}
    //             onSelectChange={mockOnSelectChange}
    //             onDateChange={mockOnDateChange}
    //         />
    //     )
    //
    //     const formattedDate = format(new Date(mockMemberDetails.dateOfBirth), "PPP")
    //     const dateButton = screen.getByRole('button', { name: new RegExp(formattedDate, 'i') })
    //     fireEvent.click(dateButton)
    //
    //     await waitFor(() => {
    //         const newDate = screen.getByText('15')
    //         fireEvent.click(newDate)
    //     })
    //
    //     expect(mockOnDateChange).toHaveBeenCalled()
    // })
})