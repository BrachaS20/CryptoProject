// onload functions
$(window).on("load", function() {
    $("#pills-home").append(`
        <div id="page-loader" class="d-flex flex-wrap justify-content-center mx-auto">
            <img src="Images/coinloader1.gif" class="w-50" />
        </div>
    `);
    showCards();
    displayAbout();
});

let all_id = [];
let getPricesInterval;

function getInfoFromServer(url) {
    return new Promise(function (resolve, reject) {
        $.ajax({
            url: url,
            success: resolve,
            error: reject
        });
    });
}

async function showCards() {
    try {
        const cards = await getInfoFromServer("https://api.coingecko.com/api/v3/coins/list");
        displayCards(cards);  
    } catch (error) {
        alert(error.message);
    }
}

function displayCards(cards) {
    $("#page-loader").remove();
    cards = cards.slice(0, 100);

    for(let card of cards) {
        all_id.push(card.id)
        $("#pills-home").append(`
            <div class="gx-2">
                <div class="col-lg-4 col-md-3 col-sm-12 p-2 g-0">
                    <div class="card mainCard">
                        <div class="card-body">
                            <div class="row" id="${card.symbol}">
                                <div class="col-sm-6 col-lg-10">
                                    <h5 class="card-title"><b>${(card.symbol).toUpperCase()}</b></h5>
                                </div>
                                <div class="col-6 col-lg-2">
                                    <div class="form-check form-switch">
                                        <input class="form-check-input" type="checkbox" id="${card.id}" data-toggle="modal" data-target="#staticBackdrop" />
                                    </div>
                                </div>
                            </div>
                            <p class="d-none">${card.id}</p>
                            <p class="card-text">${(card.name).toLowerCase()}</p>
                            <button class="btn btn-primary collapsed" type="button" data-toggle="collapse" data-target="#${card.id}" aria-expanded="false" aria-controls="${card.id}">More Info</button>
                            <div class="collapse" id="${card.id}">

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `);
    }
}


function displayAbout() {
    $("#pills-about").append(`
        <div class="about">
            <div class="card" style="width: 18rem;">
                <img src="Images/bracha2.jpeg" class="card-img-top" alt="That me..(:">
                <h5 class="card-title" id="about-title">Bracha Sabach</h5>
                <div class="card-body">
                    <div class="card-text" id="about-body">
                        This is my JQuery-AJAX API Project.</br> 
                        Here, you can view information about the digital currencies.</br> 
                        Names, prices, image, etc.</br> 
                        Good Luck!
                    </div>
                </div>
            </div>
        </div>
    `);
}


$(function() {
    // remove Parallax scrolling from 'About' and 'Live Reports' pages
    $("#pills-about-tab, #pills-live-reports-tab").on("click", function() {
        $(".crypto").slideUp("slow");
    })

    // show Parallax scrolling in 'Home' page
    $("#pills-home-tab").on("click", function() {
        $(".crypto").slideDown("slow");
    })

    let coinsInfo = new Map(); // Create Map array for the coins that will get 'more-info' from the server
    let selectedCoins = []; // Create ids array for the selected coins
    let selectedCoinsSymbols = []; // Creata symbols array for the selected coins
    let removeCoinFromModal = []; // Create array for the un-selected coins in modal

    // Search specific coin
    $("#button-addon2").on("click", function() {

        let value = $("[aria-label='Search']").val().toLowerCase(); // Get the value of the 'search' input
        $(".card-title").each(function() { // Makes a filter for the appropriate values
            $(this).parents(".card").slideUp("slow");

            if(value === $(this).text().toLowerCase()) { // show a specific card
                $(this).parents(".card").slideDown("slow");
            }

            if (value === "") { // show all the cards
                $(this).parents(".card").slideDown("slow");
            }
            
        });
    });

    // More-Info button - main page
    $("#pills-home").on("click", '[data-toggle="collapse"]', function() {

        const coinID = $(this).attr("aria-controls");

        setTimeout( // Delete the info after 2 minutes
            () => {
                $(`div[id~=${coinID}]`).empty();
                coinsInfo.delete(coinID);
                console.log(coinsInfo);
            }, 120000
        );

        // If less than 2 minutes have passed, show the information.
        // If 2 minutes have passed, make a new call to the server.
        if (coinsInfo.has(coinID)) {
            $(`div[id~=${coinID}]`).slideToggle("slow");
        } else {
            $(this).after(`
                <div id="card-loader">
                    <img src="Images/Ajux_loader.gif" class="w-50"/>
                </div>    
            `);
            getCoinInfo(coinID);
        }

    });

    async function getCoinInfo(coinID) {
        try {
            if(coinID === "") {
                alert(`ID is not define. Can't get info.`);
            } else {
                const info = await getInfoFromServer(`https://api.coingecko.com/api/v3/coins/${coinID}`);
                console.log(info);
                saveInfo(info);    
            }
        } catch (error) {
            alert(error.message);
        }
    }

    function saveInfo(info) {

        // Save the coin info as object
        const coin = {
            id: info.id,
            image: info.image.thumb,
            currentPriceUSD: info.market_data.current_price.usd,
            currentPriceEUR: info.market_data.current_price.eur,
            currentPriceILS: info.market_data.current_price.ils
        };

        coinsInfo.set(coin.id, coin); // Save the Object in Map array
        displayInfo(coin); // Display the info

    }

    // Dispaly More Info For specific coin
    function displayInfo(coin) {
        $("#card-loader").remove();
        $(`div[id~=${coin.id}]`).html(`
            <div class="info">
                <img src="${coin.image}" id="img-coin"/>
                <div><b>USD:</b> ${coin.currentPriceUSD}<b>$</b></div>
                <div><b>EUR:</b> ${coin.currentPriceEUR}<b>€</b></div>
                <div><b>ILS:</b> ${coin.currentPriceILS}<b>₪</b></div>
            </div>
        `);
        $(`div[id~=${coin.id}]`).slideDown("slow");
    }


    // Switch button - main page
    $("#pills-home").on("change", "input", function() {
        let id = $(this).attr("id");
        let symbol = $(this).parents(".row").attr("id").toUpperCase();

        // if the button is checked - push card id+symbol to array and clone this card to the modal
        // if the button is unchecked - remove card id+symbol from array and remove this card from the modal
        if ($(this).is(':checked')) {
            selectedCoins.push(id);
            selectedCoinsSymbols.push(symbol);

            if (selectedCoins.length > 5) {
                $(this).parents(".card").clone().appendTo(".modal-body").hide(); // Copy the card to modal but with 'hide' calss
                toggleModal(); // Show modal
            } else {
                $(this).parents(".card").clone().appendTo(".modal-body"); // Copy the card to modal
            }

        } else {
            removeItemFromArray(selectedCoins, id);
            removeItemFromArray(selectedCoinsSymbols, symbol);
            $(".modal-body").children(`.card:contains(${id})`).remove();
        }
    })


    // Switch button - Modal
    $("#mainModal").on("change", "input", function() {
        let id = $(this).attr("id");

        // if the button is checked - remove card id from array.
        // if the button is unchecked - push card id to array of modal.
        if ($(this).is(":checked")) {
            removeItemFromArray(removeCoinFromModal, id);
        } else {
            removeCoinFromModal.push(id);
        }
    })


    // More-Info button - Modal
    $("#mainModal").on("click", '[data-toggle="collapse"]', function() {
        const coinID = $(this).attr("aria-controls");
        getCoinInfoModal(coinID);
    })

    async function getCoinInfoModal(coinID) {
        try {
            const info = await getInfoFromServer(`https://api.coingecko.com/api/v3/coins/${coinID}`);
            displayCoinInfoModal(info);
        } catch (error) {
            alert(error.message);
        }
    }

    // Display more-info in Modal
    function displayCoinInfoModal(info) {
        let current_card = $(".modal-body").children(`.card:contains(${info.id})`);

        $(current_card).popover({

            id: `modalPopover`,
            placement : 'right',
            html : true,
            trigger : 'show', 
            title: (info.symbol).toUpperCase(),
            content: `
                USD: ${info.market_data.current_price.usd}$<br/>
                EUR: ${info.market_data.current_price.eur}€<br/>
                ILS: ${info.market_data.current_price.ils}₪
            `
        });
        
        $(current_card).popover('toggle');
    }
    

    // Save-Changes button in Modal
    $("#saveChanges").on("click", function() {

        if (removeCoinFromModal.length === 0) {
            removeLastCard();
        }
        
        // Go through all the switch buttons on the main page
        $(".form-check-input").each(function() {

            $(this).prop("checked", false);
            let id = $(this).attr("id");
            let symbol = $(this).parents(".row").attr("id").toUpperCase();

            // if the modal array contain id of card
            //  1. remove this card from the modal
            //  2. remove this card id+symbol from array
            //  3. remove this id from the modal array
            //  4. show the last card in the modal
            for (let i = 0 ; i < removeCoinFromModal.length ; i++) {
                if (removeCoinFromModal[i] === id) {
                    $(".modal-body").children(`.card:contains(${removeCoinFromModal[i]})`).remove();
                    removeItemFromArray(removeCoinFromModal, id);
                    removeItemFromArray(selectedCoins, id);
                    removeItemFromArray(selectedCoinsSymbols, symbol);
                    $(".modal-body").children(".card").last().show();
                }
            }

            // if selected coins array contain id of card - activate the switch button
            for (let i = 0 ; i < selectedCoins.length ; i++) {
                if (selectedCoins[i] === id) {
                    $(this).prop("checked", true);
                }
            }

        });

        toggleModal();
    })


    // Close Modal button
    $('[data-dismiss="modal"]').on("click", function() {

        removeLastCard();
        removeCoinFromModal.splice(0 ,removeCoinFromModal.length); // clear the modal array

        // Activate all the switch buttons in modal
        $(".modal-body .form-check-input").each(function() {
            $(this).prop("checked", true);
        })

        // Go through all the switch buttons on the main page
        $(".form-check-input").each(function() {
            $(this).prop("checked", false);

            // Activate only the switch buttons for those id is in the selected coins array
            for (let i = 0 ; i < selectedCoins.length ; i++) {
                if (selectedCoins[i] === $(this).attr("id")) {
                    $(this).prop("checked", true);
                }
            }

        })

        toggleModal();
    })

    // Function for removing the last card that checked
    function removeLastCard() {
        $(".modal-body").children(".card").last().remove(); // Remove the last card added from the modal
        selectedCoins.pop(); // Delete the card id from the array
        selectedCoinsSymbols.pop(); // Delete the card symbol from the array
    }

    // Function for show/hide the modal
    function toggleModal() {
        for (let id of all_id) {
            for (let coin of selectedCoins) {
                if (id === coin) {
                    $(`div[id~=${id}]`).slideUp("slow");
                }
            }

        }
        $(".modal").modal("toggle");
    }

    // Function for removing items from an array
    function removeItemFromArray(array, prop) {
        for(let i = 0 ; i < array.length ; i++) {
            if (array[i] === prop) {
                array.splice(i, 1);
            }
        }
    }

    // Dispaly Live-reports graph
    $("#pills-live-reports-tab").on("click", function () {

        // Clearing the graph from the live report page at each new entry to the page
        clearInterval(getPricesInterval);

        if (selectedCoinsSymbols.length === 0) {
            $("#chartContainer").empty();
            alert("To view live reports, you must add coins to your report list");
        } else {
            let urlForGraph = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${selectedCoinsSymbols}&tsyms=USD`;
    
            let options = {
                exportEnabled: true,
                animationEnabled: false,
                title:{
                    text: selectedCoinsSymbols + " to USD"
                },
                subtitles: [{
                    text: "Click a coin name to hide its data"
                }],
                axisX: {
                    title: ""
                },
                axisY2: {
                    title: "Profit in USD",
                    titleFontColor: "#C0504E",
                    lineColor: "#C0504E",
                    labelFontColor: "#C0504E",
                    tickColor: "#C0504E"
                },
                axisY: {
                    title: "Coin Value",
                    titleFontColor: "#4F81BC",
                    lineColor: "#4F81BC",
                    labelFontColor: "#4F81BC",
                    tickColor: "#4F81BC"
                },
                toolTip: {
                    shared: true
                },
                legend: {
                    cursor: "pointer",
                    itemclick: toggleDataSeries
                },
                data: [{
                    type: "spline",
                    name: selectedCoinsSymbols[0],
                    axisYType: "secondary",
                    showInLegend: true,
                    xValueFormatString: "MMM YYYY",
                    yValueFormatString: "#,##0.#$",
                    dataPoints: [
                    ]
                },
                {
                    type: "spline",
                    name: selectedCoinsSymbols[1],
                    showInLegend: true,
                    xValueFormatString: "MMM YYYY",
                    yValueFormatString: "#,##0.#$",
                    dataPoints: [
                    ]
                },
                {
                    type: "spline",
                    name: selectedCoinsSymbols[2],
                    showInLegend: true,
                    xValueFormatString: "MMM YYYY",
                    yValueFormatString: "#,##0.#$",
                    dataPoints: [
                    ]
                },
                {
                    type: "spline",
                    name: selectedCoinsSymbols[3],
                    showInLegend: true,
                    xValueFormatString: "MMM YYYY",
                    yValueFormatString: "#,##0.#$",
                    dataPoints: [
                    ]
                },
                {
                    type: "spline",
                    name: selectedCoinsSymbols[4],
                    showInLegend: true,
                    xValueFormatString: "MMM YYYY",
                    yValueFormatString: "#,##0.#$",
                    dataPoints: [
                    ]
                }]
            };
            
            function toggleDataSeries(e) {
                if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                    e.dataSeries.visible = false;
                } else {
                    e.dataSeries.visible = true;
                }
                e.chart.render();
            }

            // Update data Every two seconds
            getPricesInterval = setInterval(() => {
                getPricesDataFromServer(urlForGraph, options);
            }, 2000);
                
        }
    })
    
    // Get data for the graph from server
    async function getPricesDataFromServer(urlForGraph, options) {
        try {
            const result = await getInfoFromServer(urlForGraph);
            updateGraphData(result, options); 
        } catch (error) {
            alert(error.message);
        }
    }
    
    // Live Graph Update
    function updateGraphData(result, options) {
        let indexOfData = 0;
    
        for (let coin in result) {
            options.data[indexOfData].dataPoints.push({ x: new Date(), y: result[coin].USD });
            indexOfData++;
        }
    
        $("#chartContainer").CanvasJSChart(options);
    }

});


