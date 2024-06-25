const participants = [];
const payments = [];

function addParticipant() {
  const participant = document.getElementById("participant").value;
  if (participant) {
    participants.push(participant);
    document.getElementById("participant").value = "";
    displayParticipants();
    displayParticipantCheckboxes();
    displayPayerDropdown();
  }
}

function deleteParticipant(index) {
  participants.splice(index, 1);
  displayParticipants();
  displayParticipantCheckboxes();
  displayPayerDropdown();
}

function displayParticipants() {
  const participantsList = document.getElementById("participants-list");
  participantsList.innerHTML = "<h5>Participants:</h5>";
  participants.forEach((participant, index) => {
    participantsList.innerHTML += `<p>${
      index + 1
    }. ${participant} <span class="delete-icon" onclick="deleteParticipant(${index})">🗑️</span></p>`;
  });
}

function displayParticipantCheckboxes() {
  const participantsCheckboxes = document.getElementById(
    "participants-checkboxes"
  );
  participantsCheckboxes.innerHTML = "<h5>Select Participants:</h5>";
  participants.forEach((participant, index) => {
    participantsCheckboxes.innerHTML += `<label><input type="checkbox" value="${index}" checked /> ${participant}</label><br/>`;
  });
}

function displayPayerDropdown() {
  const payerDropdown = document.getElementById("payer");
  payerDropdown.innerHTML = "";
  participants.forEach((participant, index) => {
    payerDropdown.innerHTML += `<option value="${index}">${participant}</option>`;
  });
}

function toggleSplitType() {
  const splitType = document.getElementById("split-type").value;
  const participantsCheckboxes = document.getElementById(
    "participants-checkboxes"
  );
  participantsCheckboxes.innerHTML = "";
  participants.forEach((participant, index) => {
    if (splitType === "equal") {
      participantsCheckboxes.innerHTML += `<label><input type="checkbox" value="${index}" checked /> ${participant}</label><br/>`;
      document.getElementById("remaining-amount").innerHTML = "";
    } else {
      participantsCheckboxes.innerHTML += `<label>${participant} <input type="number" class="form-control split-input" id="split-amount-${index}" value="0" oninput="updateRemainingAmount()" style="display:inline; width:auto; margin-left:10px;" /></label><br/>`;
    }
  });
  updateRemainingAmount();
}

function updateRemainingAmount() {
  const splitType = document.getElementById("split-type").value;
  const paymentAmount = parseFloat(
    document.getElementById("payment-amount").value
  );
  let remainingAmount = paymentAmount;

  if (splitType === "unequal") {
    const splitInputs = document.querySelectorAll(".split-input");
    splitInputs.forEach((input) => {
      remainingAmount -= parseFloat(input.value);
    });
    document.getElementById(
      "remaining-amount"
    ).innerHTML = `<p>Remaining Amount: ₹${remainingAmount.toFixed(2)}</p>`;
  } else {
    document.getElementById("remaining-amount").innerHTML = "";
  }
}

function addPayment() {
  const paymentType = document.getElementById("payment-type").value;
  const paymentAmount = parseFloat(
    document.getElementById("payment-amount").value
  );
  const payer = parseInt(document.getElementById("payer").value);
  const splitType = document.getElementById("split-type").value;

  let selectedParticipants = [];
  let remainingAmount = paymentAmount;

  if (splitType === "equal") {
    selectedParticipants = Array.from(
      document.querySelectorAll(
        '#participants-checkboxes input[type="checkbox"]:checked'
      )
    ).map((cb) => parseInt(cb.value));
  } else {
    selectedParticipants = participants
      .map((_, index) => {
        const amount = parseFloat(
          document.getElementById(`split-amount-${index}`).value
        );
        if (amount > 0) {
          remainingAmount -= amount;
          return index;
        }
      })
      .filter((index) => index !== undefined);
  }
  if (splitType === "unequal") {
    remainingAmount = selectedParticipants.reduce((remaining, index) => {
      return (
        remaining -
        parseFloat(document.getElementById(`split-amount-${index}`).value)
      );
    }, paymentAmount);
  }

  if (paymentType && paymentAmount && !isNaN(payer)) {
    if (splitType === "equal") {
      if (selectedParticipants.length === 0) return;
      payments.push({
        paymentType,
        paymentAmount,
        payer,
        selectedParticipants,
      });
    }
    if (splitType === "unequal") {
      if (remainingAmount !== 0) return;
      const splitAmounts = selectedParticipants.map((value, index) =>
        parseFloat(document.getElementById(`split-amount-${index}`).value)
      );
      payments.push({
        paymentType,
        paymentAmount,
        payer,
        selectedParticipants,
        splitAmounts,
      });
    }
    document.getElementById("payment-type").value = "";
    document.getElementById("payment-amount").value = "";
    document.getElementById("remaining-amount").innerHTML = "";
    displayPayments();
    resetCheckboxes();
  }
}

function deletePayment(index) {
  payments.splice(index, 1);
  displayPayments();
}

function resetCheckboxes() {
  const checkboxes = document.querySelectorAll(
    '#participants-checkboxes input[type="checkbox"]'
  );
  checkboxes.forEach((checkbox) => {
    checkbox.checked = true;
  });

  const splitInputs = document.querySelectorAll(".split-input");
  splitInputs.forEach((input) => {
    input.value = 0;
  });

  document.getElementById("split-type").value = "equal";
  displayParticipantCheckboxes();
}

function displayPayments() {
  const paymentsResultDiv = document.getElementById("payments-result");
  paymentsResultDiv.innerHTML = "<h5>Payments:</h5>";
  console.log(payments);
  payments.forEach((payment, index) => {
    let paymentText = `<div class="entry"><p><strong>${
      participants[payment.payer]
    }</strong> paid for <strong>${
      payment.paymentType
    }</strong>: <strong>₹${payment.paymentAmount.toFixed(2)}</strong>`;

    if (payment.splitAmounts) {
      payment.splitAmounts.forEach((amount, i) => {
        paymentText += `, <strong>${
          participants[payment.selectedParticipants[i]]
        }'s </strong> part is <strong>₹${amount.toFixed(2)}</strong>`;
      });
    } else {
      const participantNames = payment.selectedParticipants
        .map((i) => participants[i])
        .join(", ");
      paymentText += ` and is split among <strong>${participantNames}</strong>`;
    }

    paymentText += ` <span class="delete-icon" onclick="deletePayment(${index})">🗑️</span></p></div>`;
    paymentsResultDiv.innerHTML += paymentText;
  });
}

function calculateBalance() {
  const balances = participants.map(() => 0);

  payments.forEach((payment) => {
    if (payment.splitAmounts) {
      payment.splitAmounts.forEach((amount, i) => {
        balances[payment.selectedParticipants[i]] -= amount;
      });
    } else {
      const amountPerPerson =
        payment.paymentAmount / payment.selectedParticipants.length;
      payment.selectedParticipants.forEach((index) => {
        balances[index] -= amountPerPerson;
      });
    }
    balances[payment.payer] += payment.paymentAmount;
  });

  const balanceResultDiv = document.getElementById("balance-result");
  balanceResultDiv.innerHTML = "<h5>Balances:</h5>";
  participants.forEach((participant, index) => {
    balanceResultDiv.innerHTML += `<p><strong>${participant}</strong>: ₹${balances[
      index
    ].toFixed(2)}</p>`;
  });

  const positiveBalances = [];
  const negativeBalances = [];
  participants.forEach((participant, index) => {
    if (balances[index] > 0) {
      positiveBalances.push({ name: participant, balance: balances[index] });
    } else if (balances[index] < 0) {
      negativeBalances.push({ name: participant, balance: balances[index] });
    }
  });

  balanceResultDiv.innerHTML += "<h5>Settlements:</h5>";
  positiveBalances.forEach((p) => {
    negativeBalances.forEach((n) => {
      if (n.balance < 0) {
        const payment = Math.min(p.balance, -n.balance);
        if (payment > 0) {
          balanceResultDiv.innerHTML += `<p><strong>${
            n.name
          }</strong> owes <strong>${p.name}</strong> ₹${payment.toFixed(
            2
          )}</p>`;
          p.balance -= payment;
          n.balance += payment;
        }
      }
    });
  });
}

function shareOnWhatsApp() {
  let paymentsText = "*Payments:*\n";
  payments.forEach((payment) => {
    let paymentDetail = `*${participants[payment.payer]}* paid for *${
      payment.paymentType
    }*: *₹${payment.paymentAmount.toFixed(2)}*`;

    if (payment.splitAmounts) {
      payment.splitAmounts.forEach((amount, i) => {
        paymentDetail += `, *${
          participants[payment.selectedParticipants[i]]
        }* paid *₹${amount.toFixed(2)}*`;
      });
    } else {
      const participantNames = payment.selectedParticipants
        .map((i) => `*${participants[i]}*`)
        .join(", ");
      paymentDetail += ` and is split among ${participantNames}`;
    }

    paymentsText += `${paymentDetail}\n`;
  });

  let balancesText = "*Balances:*\n";
  const balances = participants.map(() => 0);
  payments.forEach((payment) => {
    if (payment.splitAmounts) {
      payment.splitAmounts.forEach((amount, i) => {
        balances[payment.selectedParticipants[i]] -= amount;
      });
    } else {
      const amountPerPerson =
        payment.paymentAmount / payment.selectedParticipants.length;
      payment.selectedParticipants.forEach((index) => {
        balances[index] -= amountPerPerson;
      });
    }
    balances[payment.payer] += payment.paymentAmount;
  });

  participants.forEach((participant, index) => {
    balancesText += `*${participant}*: *₹${balances[index].toFixed(2)}*\n`;
  });

  const positiveBalances = [];
  const negativeBalances = [];
  participants.forEach((participant, index) => {
    if (balances[index] > 0) {
      positiveBalances.push({ name: participant, balance: balances[index] });
    } else if (balances[index] < 0) {
      negativeBalances.push({ name: participant, balance: balances[index] });
    }
  });

  let settlementsText = "\n*Settlements:*\n";
  positiveBalances.forEach((p) => {
    negativeBalances.forEach((n) => {
      if (n.balance < 0) {
        const payment = Math.min(p.balance, -n.balance);
        settlementsText += `*${n.name}* owes *${p.name}* *₹${payment.toFixed(
          2
        )}*\n`;
        p.balance -= payment;
        n.balance += payment;
      }
    });
  });

  let finalText = `${paymentsText}\n${balancesText}\n${settlementsText}\nSimplify settlements with https://utkarshainos.github.io/settlemate`;
  const url = `https://wa.me/?text=${encodeURIComponent(finalText)}`;
  window.open(url, "_blank");
}
