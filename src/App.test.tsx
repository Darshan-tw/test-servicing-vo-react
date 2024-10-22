import {render, screen, waitFor, act, fireEvent, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, expect, describe, beforeEach, test } from 'vitest'
import App from './App'

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
  loanType: 'Home Loan',
  lan: 'ABCD1234EFGH5678',
  policyNumber: 'POL1234567890123',
  planNumber: 'PLAN123',
  panNumber: 'ABCDE1234F',
  originalLoanAmount: '1000000',
  sumAssured: '10000000',
  policyTerm: '20',
  rcd: new Date('2023-01-01'),
  title: 'Mr.',
  name: 'John Doe',
  gender: 'Male',
  dob: new Date('1990-01-01'),
  address: '123 Main St, Anytown, AT 12345',
  contactNumber: '+1234567890',
  email: 'john.doe@example.com',
  memberBankAccount: '1234567890',
  memberIFSC: 'ABCD0123456',
  memberBankAddress: 'XYZ Bank, 456 Bank St, Anytown, AT 12345',
  mphBankAccount: '0987654321',
  mphIFSC: 'EFGH0987654',
  mphBankAddress: 'ABC Bank, 789 MPH St, Anytown, AT 12345',
};

vi.spyOn(global, 'fetch').mockImplementation(() =>
  Promise.resolve({
    json: () => Promise.resolve(mockTestUserData),
  } as Response)
);

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders loading state initially and then removes it', async () => {
    render(<App/>);

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Edit Member Details')).toBeInTheDocument();
    });
  });

  test('renders form after loading', async () => {
    render(<App/>);

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
      expect(screen.getByText('Sum Assured must be between 10-12 times the Original Loan Amount')).toBeInTheDocument()
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

    // Edit member bank account details
    await act(async () => {
      await user.clear(memberBankAccountInput)
      await user.type(memberBankAccountInput, '9876543210')
    })
    expect(memberBankAccountInput).toHaveValue('9876543210')

    await act(async () => {
      await user.clear(memberIFSCInput)
      await user.type(memberIFSCInput, 'WXYZ9876543')
    })
    expect(memberIFSCInput).toHaveValue('WXYZ9876543')

    await act(async () => {
      await user.clear(memberBankAddressInput)
      await user.type(memberBankAddressInput, 'ABC Bank, 789 New St, Newtown, NT 54321')
    })
    expect(memberBankAddressInput).toHaveValue('ABC Bank, 789 New St, Newtown, NT 54321')

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

    const bankDetailsAccordion = screen.getByText('Bank Details')
    expect(bankDetailsAccordion).toBeInTheDocument()
    await act(async () => {
      await user.click(bankDetailsAccordion)
    })

    const memberBankAccountInput = screen.getByLabelText('Member Bank Account Number')

    expect(memberBankAccountInput).toHaveValue('1234567890')
    await act(async () => {
      await user.clear(memberBankAccountInput)
      await user.type(memberBankAccountInput, '9876543210')
    })
    expect(memberBankAccountInput).toHaveValue('9876543210')


    const submitButton = screen.getByRole('button', { name: /submit for review/i })
    await act(async () => {
      await user.click(submitButton)
    })

    await waitFor(() => {
      expect(screen.getByText('Review Changes')).toBeInTheDocument()
    })

    expect(screen.getByText('hello.pdf')).toBeInTheDocument()
    expect(screen.getByText('MemberBankAccount Change')).toBeInTheDocument()
    expect(screen.getByText('Old Value')).toBeInTheDocument()
    expect(screen.getByText('New Value')).toBeInTheDocument()
    expect(screen.getByText('1234567890')).toBeInTheDocument()
    expect(screen.getByText('9876543210')).toBeInTheDocument()
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