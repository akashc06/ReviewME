(function () {
    angular
        .module("Project")
        .controller("HomeController", HomeController);

    function HomeController(UserService, $location, RestService, $http, $rootScope){
        var vm = this;

        vm.city = "Boston";
        vm.tosay = "Around you,";
        vm.login = login;
        vm.register = register;
        vm.restsearch = restsearch;
        vm.sendKey  = sendKey;
        vm.getLocation = getLocation;
        vm.eraseData = eraseData;

        function eraseData() {
            vm.user = "";
        }

        function getLocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(showPosition);
            }
        }


        var apiGeolocationSuccess = function(position) {
            vm.Lat = position.coords.latitude;
            vm.Lon = position.coords.longitude;
            a = {lati: vm.Lat, lngi: vm.Lon};
            RestService
                .findAllCategories(a)
                .success(function (data) {
                    if(data.length == 0) {
                        vm.display = "Please enable location services";
                    }else {
                        vm.cats = data;
                        vm.pic = vm.cats.featured_image;
                    }
                });

        };

        var tryAPIGeolocation = function() {
            $http.post( "https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyAK_s72XUq-20vDe6C2jB_uthMgJXSkv40",
                function(success) {
                apiGeolocationSuccess({coords: {latitude: success.location.lat, longitude: success.location.lng}});
            })
                .error(function(err) {
                    alert("API Geolocation error! \n\n"+err);
                });
        };

        function showPosition(position) {
            vm.Lat = position.coords.latitude;
            vm.Lon = position.coords.longitude;
            a = {lati: vm.Lat, lngi: vm.Lon};
            RestService
                .findAllCategories(a)
                .success(function (data) {
                    if(data.length == 0) {
                        vm.display = "Please enable location services";
                    }else {
                    vm.cats = data;
                    vm.pic = vm.cats.featured_image;
                    }
                });
        }

        function sendKey(name, city) {
            vm.key = name;
            vm.city = city;
        }

        function restsearch(name) {
            $location.url("/home/results/"+name);
        }


        function init() {
            var latLong;
            $.getJSON("http://ipinfo.io", function(ipinfo){
                //console.log("Found location ["+ipinfo.loc+"] by ipinfo.io");
                latLong = ipinfo.loc.split(",");
                vm.lat = latLong[0];
                vm.lon = latLong[1];
                a = {lati: vm.lat, lngi: vm.lon};
                RestService
                    .findAllCategories(a)
                    .success(function (data) {
                        if(data.length == 0) {
                            vm.display = "Please enable location services";
                        }else {
                            vm.cats = data;
                            vm.pic = vm.cats.featured_image;
                        }
                    });
            });

        }
        init();

        function register(newuser) {
            if (newuser && newuser.username && newuser.password && newuser.cpassword) {
                if (newuser.password === newuser.cpassword) {
                    UserService
                        .findUserByUsername(newuser.username)
                        .success(function (user) {
                            vm.uerror = "Username already taken";
                        })
                        .error(function () {
                            newuser.type = "user";
                            UserService
                            .register(newuser)
                            .success(function (newUser) {
                                var user = newUser;
                                $rootScope.currentUser = newUser;
                                $location.url("/user/" + newUser._id);
                            })
                                .error(function () {
                                    vm.uerror = "User Registration Failed";
                                })
                    });
                }
                else {
                    vm.uerror = "Passowrds do not match";
                    vm.user = "";
                }
            }else {
                vm.uerror = "Enter Username";
            }
        }

        function login(user) {
            UserService
                .login(user)
                .then(function (response) {
                    $rootScope.currentUser = response.data;
                    if(response) {
                        if (vm.key) {
                            $location.url("/home/" + response.data._id + "/" + vm.key);
                        }
                        else {
                            $location.url("/home/" + response.data._id);
                        }
                    }
                    else{
                            vm.error = "User not found";
                    }

                },function (err) {
                    vm.error = "User not found";
                })

        }
    }
})();