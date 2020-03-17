var azure = require('azure-storage');
var async = require('async');
var _ = require('lodash');
var formidable = require('formidable');

function SponsorListController(sponsor) {
    this.sponsor = sponsor;
}

SponsorListController.prototype = {
    getAllSponsors: function(req, res) {
        self = this;

        var enabled = _.get(req, 'query.enabled', true);

        if (_.isString(enabled)) {
            enabled = enabled === 'true';
        }

        var query = new azure.TableQuery()
            .where('enabled eq ?', enabled);

        self.sponsor.find(query, function itemsFound(error, items) {
            res.send(JSON.stringify(items));
        });
    },

    addSponsor: function(req,res) {
        var self = this;
        new formidable.IncomingForm().parse(req, (err, fields, files) => {
            if (err) {
                console.error('Error', err)
                throw err
            }
            // console.log('Fields', fields)
            // console.log('Files', files)
            _.forEach(files, function (file) {
                console.log(file);
                self.sponsor.addItem(file, fields, function itemAdded(error, entity) {
                    if(error) {
                        throw error;
                    }
                    res.send(JSON.stringify(entity));
                });
            });
        });
    },

    updateSponsor: function (req, res) {
        var self = this;
        var updates = req.body;
        var ids = _.map(updates, "RowKey");

        async.forEach(updates, function sponsorUpdater(updatedSponsor, callback) {
            self.sponsor.updateItem(updatedSponsor, function itemsUpdated(error, result, response) {
                if(error){
                    callback(error);
                }

                callback(null, result);
            });
        }, function (error){
            if(error) {
                throw error;
            }

            res.send(JSON.stringify(ids));
        })
    },

    deleteSponsor: function(req,res) {
        var self = this;
        var id = req.params.id;

        self.sponsor.removeItem(id, function itemRemoved(error, result) {
            if(error) {
                throw error;
            }
            res.send(JSON.stringify(result));
        });
    },

};

module.exports = SponsorListController;
