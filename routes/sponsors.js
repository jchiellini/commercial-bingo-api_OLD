var azure = require('azure-storage');
var express = require('express');

var SponsorList = require('../controllers/sponsor-list.controller');
var Sponsor = require('../models/sponsor.model');

var router = express.Router();

var tableName = process.env.TABLE_NAME;
var partitionKey = process.env.PARTITION_KEY;
var accountName = process.env.STORAGE_NAME;
var accountKey = process.env.STORAGE_KEY;

var tableStoreClient = azure.createTableService(accountName, accountKey);

var sponsor = new Sponsor(tableStoreClient, tableName, partitionKey, accountName);
var sponsorList = new SponsorList(sponsor);

/* GET users listing. */
router.get('/', sponsorList.getAllSponsors.bind(sponsorList));
router.post('/', sponsorList.addSponsor.bind(sponsorList));
router.put('/', sponsorList.updateSponsor.bind(sponsorList));
router.delete('/:id', sponsorList.deleteSponsor.bind(sponsorList));

module.exports = router;
