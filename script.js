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

function addPayment() {
  const paymentType = document.getElementById("payment-type").value;
  const paymentAmount = parseFloat(
    document.getElementById("payment-amount").value
  );
  const payer = parseInt(document.getElementById("payer").value);
  const selectedParticipants = Array.from(
    document.querySelectorAll(
      '#participants-checkboxes input[type="checkbox"]:checked'
    )
  ).map((cb) => parseInt(cb.value));

  if (
    paymentType &&
    paymentAmount &&
    !isNaN(payer) &&
    selectedParticipants.length > 0
  ) {
    payments.push({ paymentType, paymentAmount, payer, selectedParticipants });
    document.getElementById("payment-type").value = "";
    document.getElementById("payment-amount").value = "";
    displayPayments();
    resetCheckboxes();
  }
}

function resetCheckboxes() {
  const checkboxes = document.querySelectorAll(
    '#participants-checkboxes input[type="checkbox"]'
  );
  checkboxes.forEach((checkbox) => {
    checkbox.checked = true;
  });
}

function displayPayments() {
  const paymentsResultDiv = document.getElementById("payments-result");
  paymentsResultDiv.innerHTML = "<h5>Payments:</h5>";
  payments.forEach((payment, index) => {
    const participantNames = payment.selectedParticipants
      .map((i) => participants[i])
      .join(", ");
    paymentsResultDiv.innerHTML += `<div class="entry"><p><strong>${
      participants[payment.payer]
    }</strong> paid for <strong>${
      payment.paymentType
    }</strong>: <strong>₹${payment.paymentAmount.toFixed(
      2
    )}</strong> and is split among <strong>${participantNames}</strong> <span class="edit-icon" onclick="showEditField(${index})">✏️</span></p></div>
                            <div class="edit-group hidden" id="edit-group-${index}">
                              <input type="number" class="form-control mb-2" id="edit-amount-${index}" value="${
      payment.paymentAmount
    }" />
                              <select class="form-control mb-2" id="edit-payer-${index}">${participants
      .map(
        (p, i) =>
          `<option value="${i}" ${
            payment.payer === i ? "selected" : ""
          }>${p}</option>`
      )
      .join("")}</select>
                              <div id="edit-participants-checkboxes-${index}" class="form-group"></div>
                              <button class="btn btn-success" onclick="saveEdit(${index})">Save</button>
                            </div>`;
    displayEditParticipantCheckboxes(index, payment.selectedParticipants);
  });
}

function displayEditParticipantCheckboxes(index, selectedParticipants) {
  const editParticipantsCheckboxes = document.getElementById(
    `edit-participants-checkboxes-${index}`
  );
  editParticipantsCheckboxes.innerHTML = "<h5>Edit Participants:</h5>";
  participants.forEach((participant, i) => {
    editParticipantsCheckboxes.innerHTML += `<label><input type="checkbox" value="${i}" ${
      selectedParticipants.includes(i) ? "checked" : ""
    } /> ${participant}</label><br/>`;
  });
}

function showEditField(index) {
  document.getElementById(`edit-group-${index}`).classList.toggle("hidden");
}

function saveEdit(index) {
  const newAmount = parseFloat(
    document.getElementById(`edit-amount-${index}`).value
  );
  const payer = parseInt(document.getElementById(`edit-payer-${index}`).value);
  const selectedParticipants = Array.from(
    document.querySelectorAll(
      `#edit-group-${index} input[type="checkbox"]:checked`
    )
  ).map((cb) => parseInt(cb.value));

  if (!isNaN(newAmount) && selectedParticipants.length > 0 && !isNaN(payer)) {
    payments[index].paymentAmount = newAmount;
    payments[index].payer = payer;
    payments[index].selectedParticipants = selectedParticipants;
    displayPayments();
  }
}

function calculateBalance() {
  const balances = participants.map(() => 0);

  payments.forEach((payment) => {
    const amountPerPerson =
      payment.paymentAmount / payment.selectedParticipants.length;
    payment.selectedParticipants.forEach((index) => {
      balances[index] -= amountPerPerson;
    });
    balances[payment.payer] += payment.paymentAmount;
  });

  const balanceResultDiv = document.getElementById("balance-result");
  balanceResultDiv.innerHTML = "";
  participants.forEach((participant, index) => {
    balanceResultDiv.innerHTML += `<p>${participant}: <strong>₹${balances[
      index
    ].toFixed(2)}</strong></p>`;
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

  balanceResultDiv.innerHTML += "<h5>Payments:</h5>";
  positiveBalances.forEach((p) => {
    negativeBalances.forEach((n) => {
      if (n.balance < 0) {
        const payment = Math.min(p.balance, -n.balance);
        balanceResultDiv.innerHTML += `<p><strong>${
          n.name
        }</strong> owes <strong>${p.name}</strong> <strong>₹${payment.toFixed(
          2
        )}</strong></p>`;
        p.balance -= payment;
        n.balance += payment;
      }
    });
  });
}

function shareOnWhatsApp() {
  let paymentsText = "*Payments:*\n";
  payments.forEach((payment) => {
    const participantNames = payment.selectedParticipants
      .map((i) => `*${participants[i]}*`)
      .join(", ");
    paymentsText += `*${participants[payment.payer]}* paid for *${
      payment.paymentType
    }*: *₹${payment.paymentAmount.toFixed(
      2
    )}* and is split among ${participantNames}\n`;
  });

  let balancesText = "*Balances:*\n";
  const balances = participants.map(() => 0);
  payments.forEach((payment) => {
    const amountPerPerson =
      payment.paymentAmount / payment.selectedParticipants.length;
    payment.selectedParticipants.forEach((index) => {
      balances[index] -= amountPerPerson;
    });
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

  let finalText = `${paymentsText}\n${balancesText}\n${settlementsText}\n\nSimplify settlements with Settlemate https://utkarshainos.github.io/settlemate`;
  const url = `https://wa.me/?text=${encodeURIComponent(finalText)}`;
  window.open(url, "_blank");
}
