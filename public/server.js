var express = require('express'); 
var path = require('path'); 
var app = express(); 
var paypal = require('paypal-rest-sdk');


// configure paypal with the credentials you got when you created your paypal app
paypal.configure({
  'mode': 'sandbox', //sandbox or live 
  'client_id': 'AU404Qs8K0_k6mWN3ipoD8_ECKWp13MkSdcCcBfJkOSWU6PXNt2VLkxtpZ8P4YPTzfI-kLCLog9cSokI', // please provide your client id here 
  'client_secret': 'EC3jflwAN68JoiGvGlzbq9_8-xQofNFeSfmIX8sScXLq2oE_6dnmavOb4EAOf6mRU8xFTzwQL4LlOASi' // provide your client secret here 
});


// set public directory to serve static html files 
app.use('/', express.static(path.join(__dirname, '/../public'))); 


// redirect to store when user hits http://localhost:3000
app.get('/' , (req , res) => {
    res.redirect('index.html'); 
})

// start payment process 
app.get('/buy' , ( req , res ) => {
	// create payment object 
    var payment = {
            "intent": "authorize",
	"payer": {
		"payment_method": "paypal"
	},
	"redirect_urls": {
		"return_url": "http://127.0.0.1:3000/success",
		"cancel_url": "http://127.0.0.1:3000/err"
	},
	"transactions": [{
		"amount": {
			"total": 39.00,
			"currency": "USD"
		},
		"description": " a book on mean stack "
	}]
    }
	
	
	// call the create Pay method 
    createPay( payment ) 
        .then( ( transaction ) => {
            var id = transaction.id; 
            var links = transaction.links;
            var counter = links.length; 
            while( counter -- ) {
                if ( links[counter].method == 'REDIRECT') {
					// redirect to paypal where user approves the transaction 
                    return res.redirect( links[counter].href )
                }
            }
        })
        .catch( ( err ) => { 
            console.log( err ); 
            res.redirect('/err');
        });
}); 


// success page 
app.get('/success' , (req ,res ) => {
    console.log(req.query); 
    res.redirect('/success.html'); 
})

// error page 
app.get('/err' , (req , res) => {
    console.log(req.query); 
    res.redirect('/err.html'); 
})

// app listens on 3000 port 
app.listen( 3000 , () => {
    console.log(' app listening on 3000 '); 
})



// helper functions 
var createPay = ( payment ) => {
    return new Promise( ( resolve , reject ) => {
        paypal.payment.create( payment , function( err , payment ) {
         if ( err ) {
             reject(err); 
         }
        else {
            resolve(payment); 
        }
        }); 
    });
}						
								
							