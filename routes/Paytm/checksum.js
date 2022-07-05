
"use strict";

var crypto = require('crypto');

class PaytmChecksum {

	static encrypt(input, key) {
		var cipher = crypto.createCipheriv('AES-128-CBC', key, PaytmChecksum.iv);
		var encrypted = cipher.update(input, 'binary', 'base64');
		encrypted += cipher.final('base64');
		return encrypted;
	}
	static decrypt(encrypted, key) {
		var decipher = crypto.createDecipheriv('AES-128-CBC', key, PaytmChecksum.iv);
		var decrypted = decipher.update(encrypted, 'base64', 'binary');
		try {
			decrypted += decipher.final('binary');
		}
		catch (e) {
			console.log(e);
		}
		return decrypted;
	}
	static generateSignature(params, key) {
		if (typeof params !== "object" && typeof params !== "string") {
			var error = "string or object expected, " + (typeof params) + " given.";
			return Promise.reject(error);
		}
		if (typeof params !== "string"){
			params = PaytmChecksum.getStringByParams(params);
		}
		return PaytmChecksum.generateSignatureByString(params, key);
	}
	

	static verifySignature(params, key, checksum) {
		if (typeof params !== "object" && typeof params !== "string") {
		   	var error = "string or object expected, " + (typeof params) + " given.";
			return Promise.reject(error);
		}
		if(params.hasOwnProperty("CHECKSUMHASH")){
			delete params.CHECKSUMHASH
		}
		if (typeof params !== "string"){
			params = PaytmChecksum.getStringByParams(params);
		}
		return PaytmChecksum.verifySignatureByString(params, key, checksum);
	}

	static async generateSignatureByString(params, key) {
		var salt = await PaytmChecksum.generateRandomString(4);
		return PaytmChecksum.calculateChecksum(params, key, salt);
	}

	static verifySignatureByString(params, key, checksum) {		
		var paytm_hash = PaytmChecksum.decrypt(checksum, key);
		var salt = paytm_hash.substr(paytm_hash.length - 4);
		return (paytm_hash === PaytmChecksum.calculateHash(params, salt));
	}

	static generateRandomString(length) {
		return new Promise(function (resolve, reject) {
			crypto.randomBytes((length * 3.0) / 4.0, function (err, buf) {
				if (!err) {
					var salt = buf.toString("base64");
					resolve(salt);					
				}
				else {
					console.log("error occurred in generateRandomString: " + err);
					reject(err);
				}
			});
		});
	}

	static getStringByParams(params) {
		var data = {};
		Object.keys(params).sort().forEach(function(key,value) {
			data[key] = (params[key] !== null && params[key].toLowerCase() !== "null") ? params[key] : "";
		});
		return Object.values(data).join('|');
	}

	static calculateHash(params, salt) {		
		var finalString = params + "|" + salt;
		return crypto.createHash('sha256').update(finalString).digest('hex') + salt;
	}
	static calculateChecksum(params, key, salt) {		
		var hashString = PaytmChecksum.calculateHash(params, salt);
		return PaytmChecksum.encrypt(hashString,key);
	}
}
PaytmChecksum.iv = '@@@@&&&&####$$$$';
module.exports = PaytmChecksum;












//OLD METHOD:///////////////////////////

// var crypt = require('./crypt');
// var util = require('util');
// var crypto = require('crypto');
 
// //mandatory flag: when it set, only mandatory parameters are added to checksum
 
// function paramsToString(params, mandatoryflag) {
//   var data = '';
//   var tempKeys = Object.keys(params);
//   tempKeys.sort();
//   tempKeys.forEach(function (key) {
//   var n = params[key].includes("REFUND");
//    var m = params[key].includes("|");  
//         if(n == true )
//         {
//           params[key] = "";
//         }
//           if(m == true)
//         {
//           params[key] = "";
//         }  
//     if (key !== 'CHECKSUMHASH' ) {
//       if (params[key] === 'null') params[key] = '';
//       if (!mandatoryflag || mandatoryParams.indexOf(key) !== -1) {
//         data += (params[key] + '|');
//       }
//     }
// });
//   return data;
// }
 
 
// function genchecksum(params, key, cb) {
//   var data = paramsToString(params);
// crypt.gen_salt(4, function (err, salt) {
//     var sha256 = crypto.createHash('sha256').update(data + salt).digest('hex');
//     var check_sum = sha256 + salt;
//     var encrypted = crypt.encrypt(check_sum, key);
//     cb(undefined, encrypted);
//   });
// }
// function genchecksumbystring(params, key, cb) {
 
//   crypt.gen_salt(4, function (err, salt) {
//     var sha256 = crypto.createHash('sha256').update(params + '|' + salt).digest('hex');
//     var check_sum = sha256 + salt;
//     var encrypted = crypt.encrypt(check_sum, key);
 
//      var CHECKSUMHASH = encodeURIComponent(encrypted);
//      CHECKSUMHASH = encrypted;
//     cb(undefined, CHECKSUMHASH);
//   });
// }
 
// function verifychecksum(params, key, checksumhash) {
//   var data = paramsToString(params, false);
 
//   //TODO: after PG fix on thier side remove below two lines
//   if (typeof checksumhash !== "undefined") {
//     checksumhash = checksumhash.replace('\n', '');
//     checksumhash = checksumhash.replace('\r', '');
//     var temp = decodeURIComponent(checksumhash);
//     var checksum = crypt.decrypt(temp, key);
//     var salt = checksum.substr(checksum.length - 4);
//     var sha256 = checksum.substr(0, checksum.length - 4);
//     var hash = crypto.createHash('sha256').update(data + salt).digest('hex');
//     if (hash === sha256) {
//       return true;
//     } else {
//       util.log("checksum is wrong");
//       return false;
//     }
//   } else {
//     util.log("checksum not found");
//     return false;
//   }
// }
 
// function verifychecksumbystring(params, key,checksumhash) {
 
//     var checksum = crypt.decrypt(checksumhash, key);
//     var salt = checksum.substr(checksum.length - 4);
//     var sha256 = checksum.substr(0, checksum.length - 4);
//     var hash = crypto.createHash('sha256').update(params + '|' + salt).digest('hex');
//     if (hash === sha256) {
//       return true;
//     } else {
//       util.log("checksum is wrong");
//       return false;
//     }
//   }
 
// function genchecksumforrefund(params, key, cb) {
//   var data = paramsToStringrefund(params);
// crypt.gen_salt(4, function (err, salt) {
//     var sha256 = crypto.createHash('sha256').update(data + salt).digest('hex');
//     var check_sum = sha256 + salt;
//     var encrypted = crypt.encrypt(check_sum, key);
//       params.CHECKSUM = encodeURIComponent(encrypted);
//     cb(undefined, params);
//   });
// }
 
// function paramsToStringrefund(params, mandatoryflag) {
//   var data = '';
//   var tempKeys = Object.keys(params);
//   tempKeys.sort();
//   tempKeys.forEach(function (key) {
//    var m = params[key].includes("|");  
//           if(m == true)
//         {
//           params[key] = "";
//         }  
//     if (key !== 'CHECKSUMHASH' ) {
//       if (params[key] === 'null') params[key] = '';
//       if (!mandatoryflag || mandatoryParams.indexOf(key) !== -1) {
//         data += (params[key] + '|');
//       }
//     }
// });
//   return data;
// }
 
// module.exports.genchecksum = genchecksum;
// module.exports.verifychecksum = verifychecksum;
// module.exports.verifychecksumbystring = verifychecksumbystring;
// module.exports.genchecksumbystring = genchecksumbystring;
// module.exports.genchecksumforrefund = genchecksumforrefund;



