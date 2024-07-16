const customerFilter = document.querySelector("#customer-filter");
const amountFilter = customerFilter.nextElementSibling;
const theChart = document.querySelector("#transaction-chart");
const noDataText = document.querySelector("#no-data-text");
let currentChart = null;

(function(){
    customerFilter.value = '';
    amountFilter.value = '';
})()

customerFilter.addEventListener("input", ()=>{
    filterByCustomer(customerFilter.value.toLowerCase());
});

amountFilter.addEventListener("input", ()=>{
    filterByAmound(amountFilter.value);
});

const API_URL = "https://mohammad-elhaw.github.io/customer-transactions-api/db.json";

let customers = [];
let transactions = [];

async function fetchData(){

    let response = await fetch(API_URL);
    response = await response.json();
    
    customers = response.customers;
    transactions = response.transactions;
    populateTable(customers, transactions);
    initiateChart();
}


function populateTable(customers, transactions){
    const tbody = document.querySelector("#tbody");
    tbody.innerHTML = '';
    
    customers.forEach(customer => {
        const customerTransactions = transactions.filter(transaction => transaction.customer_id == customer.id);
        const totalAmount = customerTransactions.reduce((sum, transaction)=> sum + transaction.amount,0);
        const row = document.createElement("tr");
        row.classList.add("text-center");
        row.innerHTML =
        `
            <td class="px-4 py-4  border border-black font-semibold">${customer.name}</td>
            <td class="px-4 py-4  border border-black font-semibold">${totalAmount}</td>
            <td class="px-4 py-4  border border-black font-semibold">
                <a class="view-btn view-btn-primary" data-customer-id="${customer.id}">View</a>
            </td>
        `;
        tbody.appendChild(row);
    });

    addEventBtns();
}

function addEventBtns(){
    document.querySelectorAll(".view-btn").forEach(button =>{
        button.addEventListener("click", (e)=>{
            const customerId = e.target.getAttribute("data-customer-id");
            const selectedCustomer = customers.find(customer=> customer.id == customerId);
            const selectedCustomerTransactions = transactions.filter(transaction=>transaction.customer_id == customerId);
            updateChartForCustomer(selectedCustomer, selectedCustomerTransactions);
        });
    });
}


function filterByCustomer(val){
    const filteredCustomers = customers.filter(customer => customer.name.toLowerCase().includes(val));
    populateTable(filteredCustomers, transactions);
    noDataText.classList.add("hidden");
    if(filteredCustomers.length == 0) clearChart(),console.log("clear");
}

function filterByAmound(val){
    if(val == ''){
        populateTable(customers, transactions);
        noDataText.classList.add("hidden");
        return;
    }
    parseFloat(val);
    const filteredCustomers = customers.filter(customer =>{
        const customerTransactions = transactions.filter(transaction => transaction.customer_id == customer.id);
        const totalAmount = customerTransactions.reduce((sum, transaction)=> sum + transaction.amount,0);
        return  totalAmount >= val;
    });
    
    populateTable(filteredCustomers, transactions);
    noDataText.classList.add("hidden");
    if(filteredCustomers.length == 0) clearChart();
}


function initiateChart(){
    cts = theChart.getContext("2d");
    currentChart = new Chart(cts,{
        type: "line",
        data: {
            labels: [],
            datasets: [{
                label: "Transaction Amount",
                data: [],
                pointBorderWidth: 2
            }]
        },
        options:{
            responsive: true,
            maintainAspectRatio: true,
            scales:{
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}


function updateChartForCustomer(customer, transactions){
    const groupByDate = {};

    transactions.forEach(transaction=>{
        if(!groupByDate[transaction.date]) groupByDate[transaction.date]= 0;
        groupByDate[transaction.date] += transaction.amount;
    });
    // console.log(groupByDate);

    const dates = Object.keys(groupByDate);
    const amounts = dates.map(date=> groupByDate[date]);
    // console.log(amount);
    // console.log(dates);

    currentChart.data.labels = dates;
    currentChart.data.datasets[0].label = `Total Transaction Amount for ${customer.name}`;
    currentChart.data.datasets[0].data = amounts;
    currentChart.update();
}


function clearChart() {
    currentChart.data.labels = [];
    currentChart.data.datasets[0].data = [];
    currentChart.update();
    noDataText.classList.remove("hidden");
}

fetchData();