import { render, screen, waitFor, act, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, expect, describe, beforeEach, test } from 'vitest'
import App from './App'
import axios from "axios";

// Mock the date-fns format function
vi.mock('date-fns', async () => {
  const actual = await vi.importActual('date-fns')
  return {
    ...actual,
    format: vi.fn((date, formatString) => actual.format(date, formatString)),
    parse: vi.fn((dateString, formatString, baseDate) => actual.parse(dateString, formatString, baseDate)),
  }
})

const mockTestUserData = {
  loanDetails: {
    loanType: 'Home Loan',
    lan: 'LAN123456789',
    policyNumber: 'POL987654321',
    planNumber: 'PLAN001',
    panNumber: 'ABCDE1234F',
    originalLoanAmount: 1500000,
    sumAssured: 1800000,
    minSumAssured: 1000000,
    maxSumAssured: 2000000,
    minTerm: 5,
    maxTerm: 30,
    policyTerm: 15,
    riskCommencementDate: '2023-06-15',
  },
  memberDetails: {
    memberNumber: 'MEM123456',
    title: 'Mr',
    name: 'John Doe',
    gender: 'Male',
    dateOfBirth: '1985-08-20',
    address: '123 Main St, Anytown, ST 12345',
    phoneNumber: '(555) 123-4567',
    email: 'john.doe@example.com',
  },
}
const testBankData = {
  memberBankAccount: '1234567890',
  memberIFSC: 'ABCD0123456',
  memberBankAddress: 'XYZ Bank, 456 Bank St, Anytown, AT 12345',
  mphBankAccount: '0987654321',
  mphIFSC: 'EFGH0987654',
  mphBankAddress: 'ABC Bank, 789 MPH St, Anytown, AT 12345',
}


// vi.spyOn(global, 'fetch').mockImplementation(() =>
//   Promise.resolve({
//     json: () => Promise.resolve(mockTestUserData),
//   } as Response)
// );

describe('App Component', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    // Correct way to mock axios.get in Vitest
    vi.spyOn(axios, 'get').mockResolvedValue({ data: mockTestUserData })
  })



  test('renders loading state initially and then removes it', async () => {
    render(<App />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Edit Member Details')).toBeInTheDocument();
    });
  });

  test('renders form after loading', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Edit Member Details')).toBeInTheDocument();
    });
    expect(screen.getByText('Loan Information')).toBeInTheDocument();
    expect(screen.getByText('Member Details')).toBeInTheDocument();
    expect(screen.getByText('Bank Details')).toBeInTheDocument();
  });

  test('validates Sum Assured field', async () => {
    const user = userEvent.setup()

    await act(async () => {
      render(<App />)
    })

    await waitFor(() => {
      expect(screen.getByText('Edit Member Details')).toBeInTheDocument()
    })

    const loanInformationAccordion = screen.getByText('Loan Information')
    await act(async () => {
      await user.click(loanInformationAccordion)
    })

    const sumAssuredInput = await screen.findByLabelText('Sum Assured')

    await act(async () => {
      await user.clear(sumAssuredInput)
      await user.type(sumAssuredInput, '5000000')
    })

    await waitFor(() => {
      expect(screen.getByText('Sum Assured must be between 1000000 and 2000000')).toBeInTheDocument()
    })
  })

  test('renders and allows editing of bank details', async () => {
    const user = userEvent.setup()

    await act(async () => {
      render(<App />)
    })

    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText('Edit Member Details')).toBeInTheDocument()
    })

    // Find and click the Bank Details accordion
    const bankDetailsAccordion = screen.getByText('Bank Details')
    expect(bankDetailsAccordion).toBeInTheDocument()
    await act(async () => {
      await user.click(bankDetailsAccordion)
    })

    // Check if all bank detail fields are present
    const memberBankAccountInput = screen.getByLabelText('Member Bank Account Number')
    const memberIFSCInput = screen.getByLabelText('Member IFSC Code')
    const memberBankAddressInput = screen.getByLabelText('Member Bank Address')
    const mphBankAccountInput = screen.getByLabelText('MPH Bank Account Number')
    const mphIFSCInput = screen.getByLabelText('MPH IFSC Code')
    const mphBankAddressInput = screen.getByLabelText('MPH Bank Address')

    expect(memberBankAccountInput).toBeInTheDocument()
    expect(memberIFSCInput).toBeInTheDocument()
    expect(memberBankAddressInput).toBeInTheDocument()
    expect(mphBankAccountInput).toBeInTheDocument()
    expect(mphIFSCInput).toBeInTheDocument()
    expect(mphBankAddressInput).toBeInTheDocument()

    // Check if editable fields have correct initial values
    expect(memberBankAccountInput).toHaveValue('1234567890')
    expect(memberIFSCInput).toHaveValue('ABCD0123456')
    expect(memberBankAddressInput).toHaveValue('XYZ Bank, 456 Bank St, Anytown, AT 12345')

    // Check if non-editable fields have correct values and are readonly
    expect(mphBankAccountInput).toHaveValue('0987654321')
    expect(mphBankAccountInput).toHaveAttribute('readOnly')
    expect(mphIFSCInput).toHaveValue('EFGH0987654')
    expect(mphIFSCInput).toHaveAttribute('readOnly')
    expect(mphBankAddressInput).toHaveValue('ABC Bank, 789 MPH St, Anytown, AT 12345')
    expect(mphBankAddressInput).toHaveAttribute('readOnly')


    // Verify that MPH bank details cannot be edited
    expect(mphBankAccountInput).toHaveAttribute('readOnly')
    expect(mphIFSCInput).toHaveAttribute('readOnly')
    expect(mphBankAddressInput).toHaveAttribute('readOnly')
  })

  test('disables submit button when no file is uploaded', async () => {
    await act(async () => {
      render(<App />)
    })

    await waitFor(() => {
      expect(screen.getByText('Edit Member Details')).toBeInTheDocument()
    })

    const submitButton = screen.getByRole('button', { name: /submit for review/i })
    expect(submitButton).toBeDisabled()
  })

  test('allows uploading documents and displays them with delete button', async () => {
    const user = userEvent.setup()

    await act(async () => {
      render(<App />)
    })

    await waitFor(() => {
      expect(screen.getByText('Edit Member Details')).toBeInTheDocument()
    })

    const fileInput = screen.getByTestId('file-upload');
    const file = new File(['hello'], 'hello.pdf', { type: 'application/pdf' })

    await act(async () => {
      await user.upload(fileInput, file)
    })

    expect(screen.getByText('hello.pdf')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
  })

  test('allows deleting uploaded files', async () => {
    const user = userEvent.setup()

    await act(async () => {
      render(<App />)
    })

    await waitFor(() => {
      expect(screen.getByText('Edit Member Details')).toBeInTheDocument()
    })

    const fileInput = screen.getByTestId('file-upload');
    const file = new File(['hello'], 'hello.pdf', { type: 'application/pdf' })

    await act(async () => {
      await user.upload(fileInput, file)
    })

    expect(screen.getByText('hello.pdf')).toBeInTheDocument()

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    await act(async () => {
      await user.click(deleteButton)
    })

    expect(screen.queryByText('hello.pdf')).not.toBeInTheDocument()
  })

  test('shows review page with uploaded documents after submission', async () => {
    const user = userEvent.setup()

    await act(async () => {
      render(<App />)
    })

    await waitFor(() => {
      expect(screen.getByText('Edit Member Details')).toBeInTheDocument()
    })

    const fileInput = screen.getByTestId('file-upload');
    const file = new File(['hello'], 'hello.pdf', { type: 'application/pdf' })

    await act(async () => {
      await user.upload(fileInput, file)
    })

    const loadAmountAccordion = screen.getByText('Loan Information')
    expect(loadAmountAccordion).toBeInTheDocument()
    await act(async () => {
      await user.click(loadAmountAccordion)
    })

    const sunAssured = screen.getByLabelText('Sum Assured')

    expect(sunAssured).toHaveValue('1800000')
    await act(async () => {
      await user.clear(sunAssured)
      await user.type(sunAssured, '2000000')
    })
    expect(sunAssured).toHaveValue('2000000')


    const submitButton = screen.getByRole('button', { name: /submit for review/i })
    await act(async () => {
      await user.click(submitButton)
    })

    await waitFor(() => {
      expect(screen.getByText('Review Changes')).toBeInTheDocument()
    })

    expect(screen.getByText('hello.pdf')).toBeInTheDocument()
    expect(screen.getByText('sumAssured Change')).toBeInTheDocument()
    expect(screen.getByText('Old Value')).toBeInTheDocument()
    expect(screen.getByText('New Value')).toBeInTheDocument()
    expect(screen.getByText('1800000')).toBeInTheDocument()
    expect(screen.getByText('2000000')).toBeInTheDocument()
  })

  test('handles gender change and updates title accordingly', async () => {
    // const user = userEvent.setup()

    await act(async () => {
      render(<App />)
    })

    await waitFor(() => {
      expect(screen.getByText('Edit Member Details')).toBeInTheDocument()
    })

    const memberDetailsAccordion = screen.getByText('Member Details')
    fireEvent.click(memberDetailsAccordion)

    const genderSelect = screen.getByLabelText('Gender')
    expect(genderSelect).toHaveTextContent('Male')

    fireEvent.click(genderSelect)
    fireEvent.click(screen.getByRole('option', { name: 'Female' }))

    const titleSelect = screen.getByLabelText('Title')
    await waitFor(() => {
      expect(titleSelect).toHaveTextContent('Ms.')
    })

    fireEvent.click(genderSelect)
    fireEvent.click(screen.getByRole('option', { name: 'Transgender' }))

    expect(titleSelect).toHaveTextContent('Ms.')
  })
})