// Initialize chart
const ctx = document.getElementById('incomeChart').getContext('2d');

let incomeChart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['1st Jan', '4th Jan', '6th Jan'],
    datasets: [{
      label: 'Income',
      data: [10500, 8000, 7500],
      backgroundColor: '#a45ff6'
    }]
  },
  options: {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            return `Amount: $${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});

// Modal toggle
const addIncomeBtn = document.querySelector(".add-income");
const modal = document.getElementById("addIncomeModal");
const closeModal = document.getElementById("closeModal");

addIncomeBtn.onclick = () => {
  modal.style.display = "flex";
};

closeModal.onclick = () => {
  modal.style.display = "none";
};

window.onclick = e => {
  if (e.target === modal) modal.style.display = "none";
};

// Icon Picker
const emojis = document.querySelectorAll(".emoji");
let selectedEmoji = "";

emojis.forEach(emoji => {
  emoji.addEventListener("click", () => {
    emojis.forEach(e => e.classList.remove("selected"));
    emoji.classList.add("selected");
    selectedEmoji = emoji.textContent;
  });
});

// Handle Add Income
document.getElementById("submitIncome").addEventListener("click", () => {
  const source = document.getElementById("incomeSource").value;
  const amount = document.getElementById("incomeAmount").value;
  const date = document.getElementById("incomeDate").value;

  if (!source || !amount || !date || !selectedEmoji) {
    alert("Please fill in all fields and select an icon.");
    return;
  }

  const options = { day: 'numeric', month: 'short' };
  const formattedDate = new Date(date).toLocaleDateString('en-GB', options);

  incomeChart.data.labels.push(`${formattedDate}`);
  incomeChart.data.datasets[0].data.push(parseFloat(amount));
  incomeChart.update();

  // Clear form
  document.getElementById("incomeSource").value = '';
  document.getElementById("incomeAmount").value = '';
  document.getElementById("incomeDate").value = '';
  emojis.forEach(e => e.classList.remove("selected"));
  selectedEmoji = '';

  modal.style.display = "none";
});
