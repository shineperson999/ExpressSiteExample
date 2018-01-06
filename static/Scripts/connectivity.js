const TIMEOUT = 1500;
let c = 0;

function ping(ip, callback) {

    if (!this.inUse) {
        this.status = 'unchecked';
        this.inUse = true;
        this.callback = callback;
        this.ip = ip;
        var _that = this;
        this.img = new Image();
        this.img.onload = function (e) {
            _that.inUse = false;
            _that.callback('responded', e);

        };
        this.img.onerror = function (e) {
            if (_that.inUse) {
                _that.inUse = false;
                _that.callback('responded', e);
            }

        };
        this.start = new Date().getTime();
        this.img.src = "http://" + ip;
        this.timer = setTimeout(function () {
            if (_that.inUse) {
                _that.inUse = false;
                _that.callback('timeout');
            }
        }, TIMEOUT);
    }
}
var PingModel = function (servers) {
    var self = this;
    var myServers = [];
    ko.utils.arrayForEach(servers, function (location) {
        myServers.push({
            name: location,
            status: ko.observable('unchecked'),
            retry:  ko.observable(0)
        });
    });
    self.servers = ko.observableArray(myServers);
    ko.utils.arrayForEach(self.servers(), function (s) {
        s.status('checking');
        alertWhenLive(s, function (status, e) {console.log(s.name,'callback retries', s.retry)
            s.status(status);debugger;
            s.retry(s.retry() + 1);
        }, function (name) { alert(name + " is back online!") });
        
        function alertWhenLive (server, callback, alertCallback) {
        	
          pingUntilSuccess();
          
          function pingUntilSuccess (status, e) {
            if (status) callback(status, e);
            console.log(server.name, 'status')
						if (status && status !== 'timeout') {debugger;
            	if (server.retry() > 1) alertCallback(server.name);
              
              return;
            }
            
            new ping(server.name, pingUntilSuccess);
        	}
        }
    });
};
var komodel = new PingModel([
    'PiController',
    'PiSlave01',
    'PiSlave02',
    'PiSlave03',
    'PiSlave04'
    ]);
ko.applyBindings(komodel);
