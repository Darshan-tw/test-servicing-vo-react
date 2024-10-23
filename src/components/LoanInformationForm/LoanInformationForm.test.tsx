import {render, screen, fireEvent, waitFor} from '@testing-library/react'
import { vi } from 'vitest'
import LoanInformationForm from './LoanInformationForm'
import {format} from "date-fns";

describe('LoanInformationForm', () => {
    const mockLoanDetails = {
        loanType: 'Personal',
        lan: 'LAN123',
        policyNumber: 'POL456',
        planNumber: 'PLAN789',
        panNumber: 'PAN101112',
        originalLoanAmount: 100000,
        sumAssured: 150000,
        minSumAssured: 100000,
        maxSumAssured: 200000,
        minTerm: 5,
        maxTerm: 20,
        policyTerm: 10,
        riskCommencementDate: '2023-01-01',
    }

    const mockOnInputChange = vi.fn()
    const mockOnSelectChange = vi.fn()
    const mockOnDateChange = vi.fn()

    it('renders all form fields', () => {
        render(
            <LoanInformationForm
                loanDetails={mockLoanDetails}
                onInputChange={mockOnInputChange}
                onSelectChange={mockOnSelectChange}
                onDateChange={mockOnDateChange}
                sumAssuredError=""
            />
        )

        expect(screen.getByLabelText('Loan Type')).toBeInTheDocument()
        expect(screen.getByLabelText('LAN')).toBeInTheDocument()
        expect(screen.getByLabelText('Policy Number')).toBeInTheDocument()
        expect(screen.getByLabelText('Plan Number')).toBeInTheDocument()
        expect(screen.getByLabelText('PAN Number')).toBeInTheDocument()
        expect(screen.getByLabelText('Original Loan Amount')).toBeInTheDocument()
        expect(screen.getByLabelText('Sum Assured')).toBeInTheDocument()
        expect(screen.getByText('Policy Term')).toBeInTheDocument()
        expect(screen.getByText('Risk Commencement Date')).toBeInTheDocument()
    })

    it('calls onInputChange when sum assured is changed', () => {
        render(
            <LoanInformationForm
                loanDetails={mockLoanDetails}
                onInputChange={mockOnInputChange}
                onSelectChange={mockOnSelectChange}
                onDateChange={mockOnDateChange}
                sumAssuredError=""
            />
        )

        const sumAssuredInput = screen.getByLabelText('Sum Assured')
        fireEvent.change(sumAssuredInput, { target: { value: '160000' } })

        expect(mockOnInputChange).toHaveBeenCalled()
    })

    it('displays sum assured error when provided', () => {
        const errorMessage = 'Sum assured is out of range'
        render(
            <LoanInformationForm
                loanDetails={mockLoanDetails}
                onInputChange={mockOnInputChange}
                onSelectChange={mockOnSelectChange}
                onDateChange={mockOnDateChange}
                sumAssuredError={errorMessage}
            />
        )

        expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })

    it('calls onSelectChange when policy term is changed', async () => {
        render(
            <LoanInformationForm
                loanDetails={mockLoanDetails}
                onInputChange={mockOnInputChange}
                onSelectChange={mockOnSelectChange}
                onDateChange={mockOnDateChange}
                sumAssuredError=""
            />
        )

        const policyTermSelectTrigger = screen.getByTestId('policyTerm')
        fireEvent.click(policyTermSelectTrigger)

        await waitFor(() => {
            const policyTermOption = screen.getByText('15')
            fireEvent.click(policyTermOption)
        })

        expect(mockOnSelectChange).toHaveBeenCalledWith('policyTerm', '15')
    })

    it('calls onDateChange when risk commencement date is changed', async () => {
        render(
            <LoanInformationForm
                loanDetails={mockLoanDetails}
                onInputChange={mockOnInputChange}
                onSelectChange={mockOnSelectChange}
                onDateChange={mockOnDateChange}
                sumAssuredError=""
            />
        )

        const formattedDate = format(new Date(mockLoanDetails.riskCommencementDate), "PPP")
        const dateButton = screen.getByRole('button', { name: new RegExp(formattedDate, 'i') })
        fireEvent.click(dateButton)

        await waitFor(() => {
            const newDate = screen.getByText('15')
            fireEvent.click(newDate)
        })

        expect(mockOnDateChange).toHaveBeenCalled()
    })
})