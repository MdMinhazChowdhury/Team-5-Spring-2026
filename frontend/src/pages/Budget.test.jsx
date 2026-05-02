import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Budget from './Budget'

function renderBudget() {
  return render(<MemoryRouter><Budget /></MemoryRouter>)
}

describe('Budget page', () => {
  describe('page structure', () => {
    it('renders heading', () => {
      renderBudget()
      expect(screen.getByText('Budget')).toBeInTheDocument()
    })

    it('renders income setup section', () => {
      renderBudget()
      expect(screen.getByText('Income Setup')).toBeInTheDocument()
      expect(screen.getByText('MONTHLY INCOME')).toBeInTheDocument()
      expect(screen.getByText('PAYMENT FREQUENCY')).toBeInTheDocument()
    })

    it('renders monthly summary section', () => {
      renderBudget()
      expect(screen.getByText('Monthly Summary')).toBeInTheDocument()
      expect(screen.getByText('INCOME')).toBeInTheDocument()
      expect(screen.getByText('BUDGETED')).toBeInTheDocument()
      expect(screen.getByText('SPENT')).toBeInTheDocument()
      expect(screen.getByText('REMAINING')).toBeInTheDocument()
    })

    it('renders budget health section', () => {
      renderBudget()
      expect(screen.getByText('Budget Health')).toBeInTheDocument()
      expect(screen.getByText('Budget Utilization')).toBeInTheDocument()
    })

    it('renders budget categories section', () => {
      renderBudget()
      expect(screen.getByText('Budget Categories')).toBeInTheDocument()
    })
  })

  describe('summary totals', () => {
    it('shows income from mock data ($4,500.00)', () => {
      renderBudget()
      // Income appears in the summary grid
      expect(screen.getByLabelText('Monthly income')).toHaveValue(4500)
    })

    it('shows correct budgeted total', () => {
      renderBudget()
      // 1200+250+500+200+200+150 = 2500
      expect(screen.getByText('$2,500.00')).toBeInTheDocument()
    })

    it('shows correct spent total', () => {
      renderBudget()
      // 1200+200+450+150+180+35 = 2215
      expect(screen.getByText('$2,215.00')).toBeInTheDocument()
    })

    it('shows correct remaining amount', () => {
      renderBudget()
      // 4500 - 2215 = 2285
      expect(screen.getByText('$2,285.00')).toBeInTheDocument()
    })
  })

  describe('overview tab', () => {
    it('renders all category names in overview', () => {
      renderBudget()
      expect(screen.getByText('Rent/Mortgage')).toBeInTheDocument()
      expect(screen.getByText('Utilities')).toBeInTheDocument()
      expect(screen.getByText('Groceries')).toBeInTheDocument()
      expect(screen.getByText('Transportation')).toBeInTheDocument()
      expect(screen.getByText('Entertainment')).toBeInTheDocument()
      expect(screen.getByText('Healthcare')).toBeInTheDocument()
    })

    it('shows approaching limit warning for >=80% categories', () => {
      renderBudget()
      // Rent/Mortgage: 1200/1200 = 100% → "Over budget"
      // Groceries: 450/500 = 90% → "Approaching limit"
      // Entertainment: 180/200 = 90% → "Approaching limit"
      const warnings = screen.getAllByText('Approaching limit')
      expect(warnings.length).toBeGreaterThanOrEqual(1)
    })

    it('shows over budget badge for 100% categories', () => {
      renderBudget()
      // Rent/Mortgage: 1200/1200 = 100%
      expect(screen.getByText('Over budget')).toBeInTheDocument()
    })
  })

  describe('edit allocations tab', () => {
    it('switches to edit allocations tab', () => {
      renderBudget()
      fireEvent.click(screen.getByRole('button', { name: 'Edit Allocations' }))
      expect(screen.getByText('Adjust the monthly limit for each category. Changes apply immediately.')).toBeInTheDocument()
    })

    it('renders input fields for each category', () => {
      renderBudget()
      fireEvent.click(screen.getByRole('button', { name: 'Edit Allocations' }))
      const inputs = screen.getAllByLabelText(/monthly limit/)
      expect(inputs).toHaveLength(6)
    })

    it('updates a category limit on blur', () => {
      renderBudget()
      fireEvent.click(screen.getByRole('button', { name: 'Edit Allocations' }))

      const groceriesInput = screen.getByLabelText('Groceries monthly limit')
      fireEvent.change(groceriesInput, { target: { value: '600' } })
      fireEvent.blur(groceriesInput)

      // Switch back to overview to verify update reflected in summary
      fireEvent.click(screen.getByRole('button', { name: 'Overview' }))
      // New budgeted total: 1200+250+600+200+200+150 = 2600
      expect(screen.getByText('$2,600.00')).toBeInTheDocument()
    })
  })

  describe('income setup', () => {
    it('updates income on blur', () => {
      renderBudget()
      const incomeInput = screen.getByLabelText('Monthly income')
      fireEvent.change(incomeInput, { target: { value: '5000' } })
      fireEvent.blur(incomeInput)
      // Remaining: 5000 - 2215 = 2785
      expect(screen.getByText('$2,785.00')).toBeInTheDocument()
    })

    it('renders payment frequency dropdown with options', () => {
      renderBudget()
      const select = screen.getByLabelText('Payment frequency')
      expect(select).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Monthly' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Bi-Weekly' })).toBeInTheDocument()
    })

    it('changes payment frequency', () => {
      renderBudget()
      const select = screen.getByLabelText('Payment frequency')
      fireEvent.change(select, { target: { value: 'Bi-Weekly' } })
      expect(select).toHaveValue('Bi-Weekly')
    })
  })
})
