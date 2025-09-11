class WellCalendar {
    constructor() {
        this.currentDate = new Date();
        this.currentMonth = this.currentDate.getMonth();
        this.currentYear = this.currentDate.getFullYear();
        this.selectedDate = null;
        
        // Load bookings from localStorage
        this.bookings = this.loadBookings();
        
        this.initializeEventListeners();
        this.renderCalendar();
    }
    
    initializeEventListeners() {
        // Month navigation
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.currentMonth--;
            if (this.currentMonth < 0) {
                this.currentMonth = 11;
                this.currentYear--;
            }
            this.renderCalendar();
        });
        
        document.getElementById('nextMonth').addEventListener('click', () => {
            this.currentMonth++;
            if (this.currentMonth > 11) {
                this.currentMonth = 0;
                this.currentYear++;
            }
            this.renderCalendar();
        });
        
        // Modal controls
        document.querySelector('.close').addEventListener('click', () => {
            this.closeModal();
        });
        
        document.getElementById('bookingModal').addEventListener('click', (e) => {
            if (e.target.id === 'bookingModal') {
                this.closeModal();
            }
        });
        
        // Booking buttons
        document.querySelectorAll('.booking-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const slot = e.target.dataset.slot;
                this.bookSlot(this.selectedDate, slot);
            });
        });
    }
    
    renderCalendar() {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        // Update month/year display
        document.getElementById('monthYear').textContent = 
            `${monthNames[this.currentMonth]} ${this.currentYear}`;
        
        // Clear calendar grid
        const calendarGrid = document.getElementById('calendarGrid');
        calendarGrid.innerHTML = '';
        
        // Get first day of month and number of days
        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        // Generate calendar days
        const today = new Date();
        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            
            const dayElement = this.createDayElement(currentDate, today);
            calendarGrid.appendChild(dayElement);
        }
    }
    
    createDayElement(date, today) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        // Add classes for styling
        if (date.getMonth() !== this.currentMonth) {
            dayElement.classList.add('other-month');
        }
        
        if (date.toDateString() === today.toDateString()) {
            dayElement.classList.add('today');
        }
        
        // Day number
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = date.getDate();
        dayElement.appendChild(dayNumber);
        
        // Booking indicators
        const bookingIndicators = document.createElement('div');
        bookingIndicators.className = 'booking-indicators';
        
        const dateStr = this.formatDate(date);
        const dayBookings = this.bookings[dateStr] || {};
        
        if (dayBookings.full) {
            const fullSlot = document.createElement('div');
            fullSlot.className = 'booking-slot full';
            bookingIndicators.appendChild(fullSlot);
        } else {
            if (dayBookings.morning) {
                const morningSlot = document.createElement('div');
                morningSlot.className = 'booking-slot morning';
                bookingIndicators.appendChild(morningSlot);
            }
            if (dayBookings.afternoon) {
                const afternoonSlot = document.createElement('div');
                afternoonSlot.className = 'booking-slot afternoon';
                bookingIndicators.appendChild(afternoonSlot);
            }
        }
        
        dayElement.appendChild(bookingIndicators);
        
        // Add click event listener
        dayElement.addEventListener('click', () => {
            this.openBookingModal(date);
        });
        
        return dayElement;
    }
    
    openBookingModal(date) {
        this.selectedDate = date;
        const modal = document.getElementById('bookingModal');
        const modalDate = document.getElementById('modalDate');
        
        modalDate.textContent = `Book for ${date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })}`;
        
        this.updateModalButtons();
        this.updateCurrentBookings();
        
        modal.style.display = 'block';
    }
    
    closeModal() {
        document.getElementById('bookingModal').style.display = 'none';
        this.selectedDate = null;
    }
    
    updateModalButtons() {
        const dateStr = this.formatDate(this.selectedDate);
        const dayBookings = this.bookings[dateStr] || {};
        
        const morningBtn = document.querySelector('[data-slot="morning"]');
        const afternoonBtn = document.querySelector('[data-slot="afternoon"]');
        const fullBtn = document.querySelector('[data-slot="full"]');
        
        // Disable buttons based on existing bookings
        morningBtn.disabled = dayBookings.morning || dayBookings.full;
        afternoonBtn.disabled = dayBookings.afternoon || dayBookings.full;
        fullBtn.disabled = dayBookings.full || (dayBookings.morning && dayBookings.afternoon);
        
        // Update button text
        morningBtn.textContent = dayBookings.morning ? 'Morning Booked' : 'Book Morning';
        afternoonBtn.textContent = dayBookings.afternoon ? 'Afternoon Booked' : 'Book Afternoon';
        fullBtn.textContent = dayBookings.full ? 'Full Day Booked' : 'Book Full Day';
    }
    
    updateCurrentBookings() {
        const dateStr = this.formatDate(this.selectedDate);
        const dayBookings = this.bookings[dateStr] || {};
        const currentBookingsDiv = document.getElementById('currentBookings');
        
        let bookingsHTML = '';
        
        if (Object.keys(dayBookings).length > 0) {
            bookingsHTML += '<h4>Current Bookings:</h4>';
            
            if (dayBookings.full) {
                bookingsHTML += `
                    <div class="booking-item">
                        <span>Full Day</span>
                        <button class="delete-booking" onclick="calendar.removeBooking('${dateStr}', 'full')">Remove</button>
                    </div>
                `;
            } else {
                if (dayBookings.morning) {
                    bookingsHTML += `
                        <div class="booking-item">
                            <span>Morning</span>
                            <button class="delete-booking" onclick="calendar.removeBooking('${dateStr}', 'morning')">Remove</button>
                        </div>
                    `;
                }
                if (dayBookings.afternoon) {
                    bookingsHTML += `
                        <div class="booking-item">
                            <span>Afternoon</span>
                            <button class="delete-booking" onclick="calendar.removeBooking('${dateStr}', 'afternoon')">Remove</button>
                        </div>
                    `;
                }
            }
        }
        
        currentBookingsDiv.innerHTML = bookingsHTML;
    }
    
    bookSlot(date, slot) {
        const dateStr = this.formatDate(date);
        
        if (!this.bookings[dateStr]) {
            this.bookings[dateStr] = {};
        }
        
        if (slot === 'full') {
            // Full day booking removes morning/afternoon and sets full
            this.bookings[dateStr] = { full: true };
        } else {
            // Individual slot booking
            this.bookings[dateStr][slot] = true;
        }
        
        this.saveBookings();
        this.renderCalendar();
        this.updateModalButtons();
        this.updateCurrentBookings();
        
        // Show success message
        this.showMessage(`${slot === 'full' ? 'Full day' : slot} booked successfully!`, 'success');
    }
    
    removeBooking(dateStr, slot) {
        if (this.bookings[dateStr]) {
            if (slot === 'full') {
                delete this.bookings[dateStr];
            } else {
                delete this.bookings[dateStr][slot];
                
                // Remove the date entry if no bookings left
                if (Object.keys(this.bookings[dateStr]).length === 0) {
                    delete this.bookings[dateStr];
                }
            }
            
            this.saveBookings();
            this.renderCalendar();
            this.updateModalButtons();
            this.updateCurrentBookings();
            
            this.showMessage(`${slot === 'full' ? 'Full day' : slot} booking removed!`, 'success');
        }
    }
    
    formatDate(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
    
    loadBookings() {
        const stored = localStorage.getItem('wellCalendarBookings');
        return stored ? JSON.parse(stored) : {};
    }
    
    saveBookings() {
        localStorage.setItem('wellCalendarBookings', JSON.stringify(this.bookings));
    }
    
    showMessage(message, type = 'info') {
        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background-color: ${type === 'success' ? '#4caf50' : '#2196f3'};
            color: white;
            border-radius: 5px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 1001;
            font-weight: bold;
        `;
        messageDiv.textContent = message;
        
        document.body.appendChild(messageDiv);
        
        // Remove after 3 seconds
        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 3000);
    }
}

// Initialize calendar when page loads
let calendar;
document.addEventListener('DOMContentLoaded', () => {
    calendar = new WellCalendar();
});