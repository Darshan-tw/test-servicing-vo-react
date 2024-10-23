import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, Mock } from 'vitest'
import axios from 'axios'
import App from './App'

// Mock axios
vi.mock('axios')

describe('App', () => {
  const mockFormData = {
    loanDetails: {
      loanType: 'Personal',
      lan: 'LAN123',
      policyNumber: 'POL001',
      planNumber: 'PLAN001',
      panNumber: 'PAN123456',
      originalLoanAmount: 100000,
      sumAssured: 150000,
      minSumAssured: 100000,
      maxSumAssured: 200000,
      minTerm: 5,
      maxTerm: 20,
      policyTerm: 10,
      riskCommencementDate: '2023-01-01',
    },
    memberDetails: {
      memberNumber: 'MEM001',
      title: 'Mr',
      name: 'John Doe',
      gender: 'Male',
      dateOfBirth: '1990-01-01',
      address: '123 Main St, City, Country',
      phoneNumber: '1234567890',
      email: 'john@example.com',
    },
  }

  beforeEach(() => {
    // Mock the API call
    (axios.get as Mock).mockResolvedValue({ data: mockFormData })
  })

  it('renders the form and fetches initial data', async () => {
    render(<App />)

    // Wait for the data to be fetched and rendered
    await waitFor(() => {
      expect(screen.getByText('Edit Member Details')).toBeInTheDocument()
    })

    // Check if loan information is rendered
    expect(screen.getByText('Loan Information')).toBeInTheDocument()

    // Check if member details are rendered
    expect(screen.getByText('Member Details')).toBeInTheDocument()

    // Check if bank details are rendered
    expect(screen.getByText('Bank Details')).toBeInTheDocument()

    // Check if file upload section is rendered
    expect(screen.getByText('Upload Documents')).toBeInTheDocument()
  })

  it('handles API error when fetching user details', async () => {
    vi.spyOn(axios, 'get').mockImplementationOnce(() => Promise.reject(new Error('API Error')))

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText(/Error: An unexpected error occurred while fetching user details/)).toBeInTheDocument()
    })
  })

  it('allows editing form fields', async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Edit Member Details')).toBeInTheDocument()
    })

    // Open the Member Details accordion
    fireEvent.click(screen.getByText('Member Details'))

    // Edit phone number
    const phoneInput = screen.getByLabelText('Contact Number')
    fireEvent.change(phoneInput, { target: { value: '9876543210' } })

    expect(phoneInput).toHaveValue('9876543210')

    // Edit email
    const emailInput = screen.getByLabelText('Email')
    fireEvent.change(emailInput, { target: { value: 'newemail@example.com' } })

    expect(emailInput).toHaveValue('newemail@example.com')
  })

  it('submits the form and shows review page', async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Edit Member Details')).toBeInTheDocument()
    })

    // Mock file upload
    const file = new File(['hello'], 'hello.png', { type: 'image/png' })
    const input = screen.getByTestId('fileUpload')
    fireEvent.change(input, { target: { files: [file] } })

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /submit for review/i })
    fireEvent.click(submitButton)

    // Check if we're on the review page
    await waitFor(() => {
      expect(screen.getByText('Review Changes')).toBeInTheDocument()
    })
  })

  it('confirms and submits the form', async () => {
    (axios.post as Mock).mockResolvedValue({ status: 200 })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Edit Member Details')).toBeInTheDocument()
    })

    // Mock file upload and form submission to get to review page
    const file = new File(['hello'], 'hello.png', { type: 'image/png' })
    const input = screen.getByTestId('fileUpload')
    fireEvent.change(input, { target: { files: [file] } })
    const submitButton = screen.getByRole('button', { name: /submit for review/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Review Changes')).toBeInTheDocument()
    })

    // Confirm and submit
    const confirmButton = screen.getByRole('button', { name: /confirm and submit/i })
    fireEvent.click(confirmButton)

    // Check if success alert is shown
    await waitFor(() => {
      expect(screen.getByText('Service request created successfully.')).toBeInTheDocument()
    })
  })

  it('displays error message when submitting form fails', async () => {
    vi.mocked(axios.post).mockRejectedValueOnce(new Error('API Error'));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Edit Member Details')).toBeInTheDocument();
    });

    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = screen.getByTestId('fileUpload');
    fireEvent.change(input, { target: { files: [file] } });
    const submitButton = screen.getByRole('button', { name: /submit for review/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Review Changes')).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /confirm and submit/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText(/Error: API Error/i)).toBeInTheDocument();
    });
  });

  it('displays default error message for unknown errors', async () => {
    vi.mocked(axios.post).mockRejectedValueOnce({});

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Edit Member Details')).toBeInTheDocument();
    });

    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = screen.getByTestId('fileUpload');
    fireEvent.change(input, { target: { files: [file] } });
    const submitButton = screen.getByRole('button', { name: /submit for review/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Review Changes')).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /confirm and submit/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText(/Error: Failed to submit changes/i)).toBeInTheDocument();
    });
  });

  it('displays "No changes made" when no changes are made', async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Edit Member Details')).toBeInTheDocument()
    })

    const file = new File(['hello'], 'hello.png', { type: 'image/png' })
    const input = screen.getByTestId('fileUpload')
    fireEvent.change(input, { target: { files: [file] } })
    const submitButton = screen.getByRole('button', { name: /submit for review/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Review Changes')).toBeInTheDocument()
    })

    expect(screen.getByText('No changes made')).toBeInTheDocument()
  })

})