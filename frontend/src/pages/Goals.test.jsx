import { render, screen, fireEvent, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Goals from './Goals'

function renderGoals() {
  return render(<MemoryRouter><Goals /></MemoryRouter>)
}

describe('Goals page', () => {
  describe('summary cards', () => {
    it('renders all four summary cards', () => {
      renderGoals()
      expect(screen.getByText('TOTAL GOALS')).toBeInTheDocument()
      expect(screen.getByText('TARGET AMOUNT')).toBeInTheDocument()
      expect(screen.getByText('TOTAL SAVED')).toBeInTheDocument()
      expect(screen.getByText('OVERALL PROGRESS')).toBeInTheDocument()
    })

    it('shows correct goal count', () => {
      renderGoals()
      // 4 mock goals, all active (current < target)
      expect(screen.getByText('4')).toBeInTheDocument()
      expect(screen.getByText('4 active, 0 completed')).toBeInTheDocument()
    })

    it('shows correct total target amount', () => {
      renderGoals()
      // 5000 + 3500 + 2000 + 8000 = 18500
      expect(screen.getByText('$18,500.00')).toBeInTheDocument()
    })

    it('shows correct total saved amount', () => {
      renderGoals()
      // 3200 + 1200 + 850 + 2500 = 7750
      expect(screen.getByText('$7,750.00')).toBeInTheDocument()
    })
  })

  describe('goal list rendering', () => {
    it('renders active tab by default', () => {
      renderGoals()
      const activeBtn = screen.getByRole('button', { name: /Active \(4\)/ })
      expect(activeBtn).toBeInTheDocument()
    })

    it('renders all 4 goal names on Active tab', () => {
      renderGoals()
      expect(screen.getByText('Emergency Fund')).toBeInTheDocument()
      expect(screen.getByText('Vacation to Europe')).toBeInTheDocument()
      expect(screen.getByText('New Laptop')).toBeInTheDocument()
      expect(screen.getByText('Car Down Payment')).toBeInTheDocument()
    })

    it('shows category badges', () => {
      renderGoals()
      expect(screen.getByText('Savings')).toBeInTheDocument()
      expect(screen.getByText('Travel')).toBeInTheDocument()
      expect(screen.getByText('Electronics')).toBeInTheDocument()
      expect(screen.getByText('Vehicle')).toBeInTheDocument()
    })

    it('switches to Completed tab and shows empty message', () => {
      renderGoals()
      fireEvent.click(screen.getByRole('button', { name: /Completed \(0\)/ }))
      expect(screen.getByText('No completed goals yet.')).toBeInTheDocument()
    })
  })

  describe('add goal modal', () => {
    it('opens modal when Add New Goal is clicked', () => {
      renderGoals()
      fireEvent.click(screen.getByRole('button', { name: /Add New Goal/ }))
      expect(screen.getByText('Add New Goal')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('e.g. Emergency Fund')).toBeInTheDocument()
    })

    it('closes modal when Cancel is clicked', () => {
      renderGoals()
      fireEvent.click(screen.getByRole('button', { name: /Add New Goal/ }))
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
      expect(screen.queryByPlaceholderText('e.g. Emergency Fund')).not.toBeInTheDocument()
    })

    it('adds a new goal to the list', () => {
      const { container } = renderGoals()
      fireEvent.click(screen.getByRole('button', { name: /Add New Goal/ }))

      fireEvent.change(screen.getByPlaceholderText('e.g. Emergency Fund'), {
        target: { value: 'Wedding Fund' },
      })
      fireEvent.change(screen.getByPlaceholderText('5000'), {
        target: { value: '10000' },
      })
      const dateInput = container.querySelector('input[type="date"]')
      fireEvent.change(dateInput, { target: { value: '2028-01-01' } })

      fireEvent.click(screen.getByRole('button', { name: 'Add Goal' }))
      expect(screen.getByText('Wedding Fund')).toBeInTheDocument()
    })
  })

  describe('edit goal', () => {
    it('opens edit modal with existing data when pencil is clicked', () => {
      renderGoals()
      const editBtns = screen.getAllByRole('button', { name: 'Edit goal' })
      fireEvent.click(editBtns[0])
      expect(screen.getByText('Edit Goal')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Emergency Fund')).toBeInTheDocument()
    })
  })

  describe('delete goal', () => {
    it('removes a goal when trash is clicked', () => {
      renderGoals()
      expect(screen.getByText('New Laptop')).toBeInTheDocument()

      const deleteBtns = screen.getAllByRole('button', { name: 'Delete goal' })
      // The 3rd goal (index 2) is "New Laptop"
      fireEvent.click(deleteBtns[2])
      expect(screen.queryByText('New Laptop')).not.toBeInTheDocument()
    })

    it('decrements total goals count after deletion', () => {
      renderGoals()
      const deleteBtns = screen.getAllByRole('button', { name: 'Delete goal' })
      fireEvent.click(deleteBtns[0])
      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.getByText('3 active, 0 completed')).toBeInTheDocument()
    })
  })
})
