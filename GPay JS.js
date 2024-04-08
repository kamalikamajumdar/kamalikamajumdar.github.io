var show = function (elem) {
	elem.classList.add('is-visible');
};

var hide = function (elem) {
  elem.classList.add('is-hide');
};


let allowCreditCards = true;
let allowPrepaidCards = false;
const allowedCardAuthMethods = ["PAN_ONLY", "CRYPTOGRAM_3DS"];
const allowedCardNetworks = ["AMEX", "DISCOVER", "INTERAC", "JCB", "MASTERCARD", "VISA"];
let assuranceDetailsRequired = false;
let billingAddressParameters = {
	format: "MIN",
	phoneNumberRequired: false
};
let billingAddressRequired = false;
let checkoutOption = "COMPLETE_IMMEDIATE_PURCHASE";
let gateway = "nuveidigital";
let gatewayMerchantId = "googletest";
let googleMerchantId = "BCR2DN6TR6Y2XRC2";
let merchantName = "Google Pay webSDK";

let tokenizationType = "PAYMENT_GATEWAY"; // М
let totalPriceStatus = "FINAL";
let googlePayEnv = 'TEST' // 'TEST' or 'PRODUCTION'
let country = 'DE';
let currency = "EUR";
let amount = '115.2'




const baseCardPaymentMethod = {
  type: 'CARD',
  parameters: {
    allowedAuthMethods: allowedCardAuthMethods,
    allowedCardNetworks: allowedCardNetworks,
    allowCreditCards: allowCreditCards,
    allowPrepaidCards: allowPrepaidCards,
    assuranceDetailsRequired: assuranceDetailsRequired,
    billingAddressRequired: billingAddressRequired,
    billingAddressParameters: billingAddressParameters,
  }
};

function getGoogleTransactionInfo() {
  return {
    countryCode: country,
    currencyCode: currency,
    totalPriceStatus: totalPriceStatus,
    totalPrice: amount,
    checkoutOption: checkoutOption
  };
}

const tokenizationSpecification = {
  type: tokenizationType,
  parameters: {
    'gateway': gateway,
    'gatewayMerchantId': gatewayMerchantId
  }
};

function getGooglePaymentDataRequest() {
  const paymentDataRequest = Object.assign({}, baseRequest);
  paymentDataRequest.allowedPaymentMethods = [cardPaymentMethod];
  paymentDataRequest.transactionInfo = getGoogleTransactionInfo();
  paymentDataRequest.merchantInfo = {
    // @todo a merchant ID is available for a production environment after approval by Google
    // See {@link https://developers.google.com/pay/api/web/guides/test-and-deploy/integration-checklist|Integration checklist}
    merchantId: googleMerchantId,
    merchantName: merchantName
  };
  return paymentDataRequest;
}




const baseRequest = {
  apiVersion: 2,
  apiVersionMinor: 0
};

const cardPaymentMethod = Object.assign({},
  baseCardPaymentMethod, {
    tokenizationSpecification: tokenizationSpecification
  }
);

let paymentsClient = null;

function getGoogleIsReadyToPayRequest() {
  return Object.assign({},
    baseRequest, {
      allowedPaymentMethods: [baseCardPaymentMethod]
    }
  );
}

function getGooglePaymentsClient() {
  if (paymentsClient === null) {
    paymentsClient = new google.payments.api.PaymentsClient({
      environment: googlePayEnv
    });
  }
  return paymentsClient;
}


function onGooglePayLoaded() {
  const paymentsClient = getGooglePaymentsClient();
  paymentsClient.isReadyToPay(getGoogleIsReadyToPayRequest())
    .then(function(response) {
      if (response.result) {
        addGooglePayButton();
      }
    })
    .catch(function(err) {
      console.error(err);
    });
}

function addGooglePayButton() {
  const paymentsClient = getGooglePaymentsClient();
  const button =
    paymentsClient.createButton({
      onClick: onGooglePaymentButtonClicked
    });
  document.getElementById('googlePayContainer').appendChild(button);
}

function prefetchGooglePaymentData() {
  const paymentDataRequest = getGooglePaymentDataRequest();
  paymentDataRequest.transactionInfo = {
    totalPriceStatus: 'NOT_CURRENTLY_KNOWN',
    currencyCode: currency
  };
  const paymentsClient = getGooglePaymentsClient();
  paymentsClient.prefetchPaymentData(paymentDataRequest);
}

function onGooglePaymentButtonClicked() {
  const paymentDataRequest = getGooglePaymentDataRequest();
  paymentDataRequest.transactionInfo = getGoogleTransactionInfo();

  const paymentsClient = getGooglePaymentsClient();
  paymentsClient.loadPaymentData(paymentDataRequest)
    .then(function(paymentData) {
      processPayment(paymentData);
    })
    .catch(function(err) {
      console.error(err);
    });
}

function processPayment(paymentData) {
  console.log(paymentData);
  payWithGooglePay(paymentData);
  paymentToken = paymentData.paymentMethodData.tokenizationData.token;
}

function payWithGooglePay(paymentToken) {   
	window.sfc.createPayment({
      sessionToken   : document.getElementById('session').value,
      merchantId     : document.getElementById('metchantID').value, //as asigned by SafeCharge
      merchantSiteId : document.getElementById('metchantSiteID').value,
      cardHolderName: 'CL-BRW1',
      "paymentOption":{
        "card":{
            "externalToken":{
                "externalTokenProvider":"GooglePay",
                "mobileToken": JSON.stringify(paymentToken.paymentMethodData),
            }
        }
      },
      "userDetails": {
          "firstName": "first_name",
          "lastName": "last_name",
          "email": "goole@pay.com",
          "phone": "phone"
      },
      "shippingAddress": {
          "address": "address",
          "city": "city",
          "country": "DE",
          "state": "",
          "zip": "1340"
      },
      "billingAddress": {
          "email": "asd@asdasd.com",
          "address": "NØRREGADE 2",
          "city": "city",
          "country": "DE",
          "state": "",
          "zip": "1335"
      },


  }, function (crRes) {
      console.log(crRes);
  })
}







function initSDK() {
  hide(document.getElementsByClassName('webSDK-placeholder')[0]);
	show(document.getElementsByClassName('toggle-content')[0]);
	var sessionToken = document.getElementById('session').value;
	var sfc = SafeCharge({
    env: 'int',
    merchantId: document.getElementById('metchantID').value,
    merchantSiteId: document.getElementById('metchantSiteID').value
  });
	window.sfc = sfc
	onGooglePayLoaded()
  
}