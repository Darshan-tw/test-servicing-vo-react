import { render, screen } from '@testing-library/react'
import BankDetailsForm from './BankDetailsForm'

describe('BankDetailsForm', () => {
    const mockBankDetails = {
        memberBankAccount: '1234567890',
        memberIFSC: 'ABCD0123456',
        memberBankAddress: 'XYZ Bank, 456 Bank St, Anytown, AT 12345',
        mphBankAccount: '0987654321',
        mphIFSC: 'EFGH0987654',
        mphBankAddress: 'ABC Bank, 789 MPH St, Anytown, AT 12345',
    }

    it('renders all bank details fields', () => {
        render(<BankDetailsForm bankDetails={mockBankDetails} />)

        expect(screen.getByLabelText('Member Bank Account Number')).toHaveValue(mockBankDetails.memberBankAccount)
        expect(screen.getByLabelText('Member IFSC Code')).toHaveValue(mockBankDetails.memberIFSC)
        expect(screen.getByLabelText('Member Bank Address')).toHaveValue(mockBankDetails.memberBankAddress)
        expect(screen.getByLabelText('MPH Bank Account Number')).toHaveValue(mockBankDetails.mphBankAccount)
        expect(screen.getByLabelText('MPH IFSC Code')).toHaveValue(mockBankDetails.mphIFSC)
        expect(screen.getByLabelText('MPH Bank Address')).toHaveValue(mockBankDetails.mphBankAddress)
    })

    it('renders all fields as read-only', () => {
        render(<BankDetailsForm bankDetails={mockBankDetails} />)

        const inputs = screen.getAllByRole('textbox')
        inputs.forEach(input =>
            expect(input).toHaveAttribute('readonly')
        )
    })
})