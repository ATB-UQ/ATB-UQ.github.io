document.addEventListener('DOMContentLoaded', () => {
    fetch('schedule.json')
        .then(response => response.json())
        .then(schedule => {
            const tbody = document.querySelector('#schedule tbody');
            const thead = document.querySelector('#schedule thead');
            const today = new Date();
            const endDate = new Date('2025-12-05');
            const thursdays = [];

            // Define the columns to be rendered and their display names
            const columns = {
                date: 'Date',
                time: 'Time',
                presenter: 'Presenter',
                topic: 'Topic',
                chair: 'Chair'
            };

            // Clear existing headers
            thead.innerHTML = '';

            // Generate table headers
            const headerRow = document.createElement('tr');
            Object.values(columns).forEach(columnName => {
                const th = document.createElement('th');
                th.textContent = columnName;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);

            // Generate all Thursdays until December 5th
            let current = new Date(today);
            current.setDate(current.getDate() + (4 - current.getDay() + 7) % 7); // Set to next Thursday
            while (current <= endDate) {
                thursdays.push(new Date(current));
                current.setDate(current.getDate() + 7);
            }

            // Convert schedule dates to a Set for quick lookup
            const scheduleDates = new Set(schedule.map(entry => new Date(entry.date).toDateString()));

            // Combine schedule entries and default entries
            const combinedSchedule = [...schedule];

            thursdays.forEach(date => {
                const dateString = date.toDateString();
                let displayDate = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

                // Check if the date is tomorrow
                const tomorrow = new Date(today);
                tomorrow.setDate(today.getDate() + 1);
                if (date.toDateString() === tomorrow.toDateString()) {
                    displayDate = 'Tomorrow';
                }

                // Check if the date is in the schedule
                if (!scheduleDates.has(dateString)) {
                    combinedSchedule.push({
                        date: dateString,
                        time: '9:30 AM',
                        presenter: 'Book this Slot!',
                        topic: 'TBA'
                    });
                }
            });

            // Sort combined schedule by date
            combinedSchedule.sort((a, b) => new Date(a.date) - new Date(b.date));

            // Render the sorted schedule
            combinedSchedule.forEach(entry => {
                if (entry.status === 'CTCMS') {
                    return; // Skip rendering this entry
                }


                const row = document.createElement('tr');
                const date = new Date(entry.date);
                let displayDate = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

                // Check if the date is tomorrow
                const tomorrow = new Date(today);
                tomorrow.setDate(today.getDate() + 1);
                if (date.toDateString() === tomorrow.toDateString()) {
                    displayDate = 'Tomorrow';
                }
                let formattedEntry;
                if (entry.status === 'Theme') {
                    formattedEntry = {
                        date: displayDate,
                        time: entry.time,
                        presenter: '',
                        topic: 'QUBIC Molecules Theme meeting',
                        chair: ''
                    };
                } else {
                    formattedEntry = {
                        date: displayDate,
                        time: entry.time,
                        presenter: entry.presenter,
                        topic: entry.topic,
                        chair: entry.chair
                    };
                }


                Object.entries(columns).forEach(([key, columnName]) => {
                    const cell = document.createElement('td');
                    const text = formattedEntry[key];

                    if (key === 'presenter' && text === 'Book this Slot!') {
                        const link = document.createElement('a');
                        link.href = 'mailto:c.macfarlane@student.uq.edu.au';
                        link.textContent = text;
                        cell.appendChild(link);
                    } else if (entry.status === 'Theme') {
                        const link = document.createElement('a');
                        link.href = 'https://atb-uq.github.io/QUBIC_Molecules_Theme/';
                        link.textContent = text;
                        cell.appendChild(link);
                    } else {
                        cell.textContent = text;
                    }

                    if (entry.status === 'pending' && (key === 'presenter' || key === 'topic' || key === 'chair')) {
                        cell.style.fontStyle = 'italic';
                        cell.style.color = 'grey';
                    }

                    row.appendChild(cell);
                });
                tbody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching schedule:', error));
});