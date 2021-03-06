angular.module('starter.controllers', ['starter.services', 'ngResource', 'plugin', 'ngRoute'])

.controller('AppCtrl', function($scope, $state, $ionicModal, $localstorage, $cordovaOauth, $ionicPopup, $http, $window, User) {

  // Form data for the login modal
  $scope.profileData = null;
 
  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  
    
      var token = window.localStorage.getItem('TokenResponse');

      if (token === null)
      {
        //$scope.login();
      }
  
    });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  $scope.fbLogin = function() {

   $cordovaOauth.facebook("519491304866168", ["email", "user_website", "user_location", "user_relationships"]).then(function(result) {
       
        $ionicPopup.alert({
          content: 'Login exitoso!'
        }).then(function(res) {
          console.log('error en el alert');
        });

        window.localStorage.setItem('TokenResponse', result.access_token);

        $http.get("https://graph.facebook.com/v2.2/me", { 
            params: {
                    access_token: result.access_token, 
                    fields: "id,name,gender,location,picture, email, first_name, last_name",
                    format: "json"
           }
        })
       .success(function(result) {

             $localstorage.setObject('user', {
              id: result.id,
              name: result.name,
              first_name: result.first_name,
              last_name: result.last_name,
              email: result.email
              });

             //mando al servidor el usuario para que lo cree 
              var newUser = new User();
             
              newUser.name = result.name;
              newUser.first_name = result.first_name;
              newUser.last_name = result.last_name;
              newUser.email = result.email;
              newUser.facebook_id = result.id;

              var dbResult = User.save(newUser, function(){
                console.log('se guardo el usuario: '+ newUser.name);
                //alert('se guardo el usuario: '+ newUser.name);
              });
              console.log(dbResult);

        })
       .error( function(error) {
                 $ionicPopup.alert({
                    content: 'Error al pedir datos del usuario.'
                  }).then(function(res) {
                    console.log('error en el alert');
                  });

        });

        $scope.modal.hide();
        $state.go('app.home');
    }, function(error) {
        $ionicPopup.alert({
          content: 'Hubo un problema al loguearse. Intente de nuevo.'
        }).then(function(res) {
          console.log('error en el alert');
        });
        console.log(error);
    });

}})

.controller('VideosCtrl', function($scope, $sce, $state, $http, $localstorage, $ionicPopup, $ionicModal) {

  var id_face = $localstorage.getObject('user').id;

  //var id_face = '10154179806703835';
  var serverIp = window.localStorage.getItem('serverIp');

  $http.get(serverIp +'users/get_videos/'+id_face).
    then(function(data) {
      // this callback will be called asynchronously
      // when the response is available
      $scope.videos = data.data.videos;
      var len = $scope.videos.length;

      for(var i=0;i<len;i++)
      { 
        var src= $scope.videos[i].url; 

        //var src = 'https://www.youtube.com/embed/h3LeVGOBjSg'

        $scope.videos[i].url= $sce.trustAsHtml('<iframe width="250px" height="150px" src="'+src+'" frameborder="0" allowfullscreen></iframe>');

      }

    }, function(response) {
         $ionicPopup.alert({
            content: 'Este usuario no tiene videos.'
          }).then(function(res) {
            console.log('error en el alert '+res);
          });
      //$state.go('app.home');
    });

  $scope.open = function(item){
        /*if ($scope.isOpen(item)){
            $scope.opened = undefined;
        } else {
            $scope.opened = item;
        }      */  
       $state.go('app.video', { id: item.id});
    };
    
  $scope.isOpen = function(item){
      return $scope.opened === item;
  };
  
  $scope.anyItemOpen = function() {
      return $scope.opened !== undefined;
  };
  
  $scope.close = function() {
      $scope.opened = undefined;
  };

  $scope.download = function(){

      $ionicModal.fromTemplateUrl('templates/descargar.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modal = modal;
        $scope.modal.show();
 
        });
  };

  $scope.doRefresh = function() {

    $http.get(serverIp +'users/get_videos/'+id_face)
     .success(function(data) {
            $scope.videos = data.data.videos;
            var len = $scope.videos.length;

            for(var i=0;i<len;i++){ 
              var src= $scope.videos[i].url; 
              $scope.videos[i].url= $sce.trustAsHtml('<iframe width="250px" height="150px" src="'+src+'" frameborder="0" allowfullscreen></iframe>');

            }

     })
     .finally(function() {
       // Stop the ion-refresher from spinning
       $scope.$broadcast('scroll.refreshComplete');
     });
  };
  $scope.descargarVideo = function(enteredValue, $cordovaFileTransfer){

      $ionicPopup.alert({
        content: 'Video en proceso de descarga'
      }).then(function(res) {
        console.log('error en el alert');
      });

      // hacer un get a /api/v1/videos/get-from-link/:url con enteredValue
      document.addEventListener("deviceready", onDeviceReady, false);

      function onDeviceReady() {
         // as soon as this function is called FileTransfer "should" be defined
         console.log(FileTransfer);
      }

      /*options = {};
      url = "http://view.ionic.io/phones.png";
      //var targetPath = cordova.file.dataDirectory + "a.jpg";
      var targetPath = "C:/Users/Magali/Desktop/files/a.jpg"
      alert('target path: '+targetPath);
      var trustHosts = true;
      var result = $cordovaFileTransfer.download(url, targetPath, options, trustHosts)
      .then(function(entry) {
              value = angular.toJson(entry.nativeURL);
              $scope.imgFile = entry.toURL();
              alert('entro al then del download');

              console.log($scope.imgFile); 
              $scope.i2 =    entry.toInternalURL(); 
              console.log($scope.i2);
      }, function(err) {
          // Error
          alert('error');
          console.log("error");
      }, function (progress) {
          $timeout(function () {
            $scope.downloadProgress = (progress.loaded / progress.total) * 100;
          })
      });
      alert('resultado cordovaFileTransfer : ' + result);*/

    
    //alert('Video en proceso de descarga..');
        //hacer el get con el link en enteredValue (NO SE CUAL ES LA URL DEL SERVER PARA ESO)
    //agregarlo a mis videos
    $scope.modal.hide();
  };

  
})

.controller('VideoCtrl', function($scope, $cordovaSocialSharing, $cordovaFile, $localstorage, $stateParams, $http, $ionicPopup, $sce, History, Favorite,$timeout) {
    
    var id_face = $localstorage.getObject('user').id;
    //Mi usuario de face
    //var id_face='10154179806703835';

    var serverIp = window.localStorage.getItem('serverIp');

    $http.get(serverIp +'videos/'+ $stateParams.id).success(function(data) {
            $scope.video = data;
            $scope.video.url_segura= $sce.trustAsHtml('<iframe width="100%" height="150px" src="'+$scope.video.url+'" frameborder="0" allowfullscreen></iframe>');
            
        });
    

    $scope.share= function(){

      $cordovaSocialSharing
      .shareViaFacebook("Mira este video en 360! Disfrutalo en realidad virtual con SenseIT", null,$scope.video.url)
      .then(function(result){
           $ionicPopup.alert({
              content: 'El video se compartió en Facebook!'
            }).then(function(res) {
              console.log('error en el alert');
            });
      }, function(err){
           $ionicPopup.alert({
              content: 'Error al compartir el video en Facebook :('
            }).then(function(res) {
              console.log('error en el alert');
            });
      });
    };

    $scope.reproducir = function(){

      var userHistory = new History();

      userHistory.id_facebook = id_face;
      userHistory.video_id = $scope.video.id;


      var dbResult = History.save(userHistory, function(){
        console.log('se guardo el historial con el resultado: ' + dbResult);
        $ionicPopup.alert({
          content: 'Se guardó el video en el historial.'
        }).then(function(res) {
          console.log('error en el alert');
        });
      });

    };

    $scope.favorito = function(){
      var favorito = new Favorite();

      favorito.id_facebook = id_face;
      favorito.video_id = $scope.video.id;

      var result = Favorite.save(favorito, function(){

        console.log(result.message);
        $ionicPopup.alert({
          content: 'Se guardó el video en favoritos.'
        }).then(function(res) {
          console.log('error en el alert');
        });

      });

    };

  
})

.controller('BusquedaCtrl', function($scope, $stateParams, $sce, $state){

  var videos = angular.fromJson($stateParams.videos);

  var len = videos.length;

  for(var i=0;i< len;i++)
  { 
    var src= videos[i].url; 
    videos[i].url = $sce.trustAsHtml('<iframe width="250px" height="150px" src="'+src+'" frameborder="0" allowfullscreen></iframe>');
  }

  $scope.videos = videos;

  $scope.open = function(item){
       $state.go('app.video', { id: item.id});
    };
    
  $scope.isOpen = function(item){
      return $scope.opened === item;
  };
  
  $scope.anyItemOpen = function() {
      return $scope.opened !== undefined;
  };
  
  $scope.close = function() {
      $scope.opened = undefined;
  };

})


.controller('historialCtrl', function($scope,$http, $sce, $localstorage, $window){

    //busco id usuario en localStorage
    var id_face = $localstorage.getObject('user').id;

    var serverIp = window.localStorage.getItem('serverIp');

    $http.get(serverIp +'histories/get-by-user/'+id_face).success(function(data) {
      $scope.historial = data;
      console.log(data);

      if(data.message == "el usuario no tiene user histories asociadas ")
      {
          $ionicPopup.alert({
            content: 'El usuario no tiene historial.'
          }).then(function(res) {
            console.log('error en el alert');
          });
      }
      else
      {

      var len = $scope.historial.length;
      var j = 0;

      $scope.videos_historial = [];

      for(var i=0;i<len;i++)
      { 
        
        var idvideo = $scope.historial[i].video_id; 



        $http.get(serverIp +'videos/'+ idvideo).success(function(data) {
        $scope.videos_historial[j] = data;   
        var src = $scope.videos_historial[j].url;

        $scope.videos_historial[j].url= $sce.trustAsHtml('<iframe width="250px" height="150px" src="'+src+'" frameborder="0" allowfullscreen></iframe>');
        j++;
        if(j == len){
      
          console.log($scope.videos_historial);
        }
        });

      }

    }

            
});
   

  $scope.open = function(item){
  
       $state.go('app.video', { id: item.id});
    };
    
  $scope.isOpen = function(item){
      return $scope.opened === item;
  };
  
  $scope.anyItemOpen = function() {
      return $scope.opened !== undefined;
  };
  
  $scope.close = function() {
      $scope.opened = undefined;
  };

  $scope.doRefresh = function() {

    $http.get(serverIp +'histories/get-by-user/'+id_face)
     .success(function(data) {
             $scope.historial = data;
              if(data.message == "el usuario no tiene user histories asociadas "){
                  $ionicPopup.alert({
                    content: 'El usuario no tiene historial.'
                  }).then(function(res) {
                    console.log('error en el alert');
                  });
              }else{

              var len = $scope.historial.length;
              var j = 0;
              $scope.videos_historial = [];
              for(var i=0;i<len;i++){ 
                var idvideo = $scope.historial[i].video_id; 
                $http.get(serverIp +'videos/'+ idvideo).success(function(data) {
                $scope.videos_historial[j] = data;   
                var src = $scope.videos_historial[j].url;
                $scope.videos_historial[j].url= $sce.trustAsHtml('<iframe width="250px" height="150px" src="'+src+'" frameborder="0" allowfullscreen></iframe>');
                j++;
                });
              }

            }
     })
     .finally(function() {
       // Stop the ion-refresher from spinning
       $scope.$broadcast('scroll.refreshComplete');
     });
  };

 
})

.controller('HomeCtrl', function($scope, $stateParams, $sce, $state, $http, $ionicModal, echo, $window, $ionicPopup, $ionicPopover){

  var serverIp = window.localStorage.getItem('serverIp');

  if($scope.videos == null){
    //hacer query y pedir toodos los videos
     $http.get(serverIp +'videos').success(function(data) {
        $scope.videos = data.videos;
        var len = $scope.videos.length;

        for(var i=0;i< len;i++)
        { 
          var src= $scope.videos[i].url; 

          $scope.videos[i].url = $sce.trustAsHtml('<iframe width="250px" height="150px" src="'+src+'" frameborder="0" allowfullscreen></iframe>');
        }

        });
  };

  $scope.open = function(item){

       $state.go('app.video', { id: item.id});
    };
    
  $scope.isOpen = function(item){
      return $scope.opened === item;
  };
  
  $scope.anyItemOpen = function() {
      return $scope.opened !== undefined;
  };
  
  $scope.close = function() {
      $scope.opened = undefined;
  };

  $scope.buscar = function(){

          // Create the login modal that we will use later
      $ionicModal.fromTemplateUrl('templates/buscar.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modal = modal;
        $scope.modal.show();
 
        });

  };

  $scope.results = [];
  $scope.findValue = function(enteredValue) {     
      
      $http.get(serverIp +'videos/search/'+enteredValue).success(function(data) {

        if(data.message == "no hay resultados para "+ enteredValue)
        {
          $ionicPopup.alert({
            content: "No se encontraron resultados"
          }).then(function(res) {
            console.log('error en el alert');
          });
        }
        else
        {

         $scope.modal.hide();
         var json = angular.toJson(data.videos, false);
         $state.go('app.busqueda', { videos: json});
        }

      });
    
  };

  $ionicPopover.fromTemplateUrl('templates/reordenar.html', {
    scope: $scope,
  }).then(function(popover) {
    $scope.popover = popover;
  });

  $scope.closePopover = function() {
    var promise = $scope.popover.hide();
  };
  $scope.pedirVideosPopulares = function(){
    alert("videos populares");
    //Hacer el http get para que los ordene por populares
  };

  $scope.pedirVideosFecha = function(){
    alert("videos por fecha");
    //Hacer el http get para que los ordene por fecha
  };

  $scope.reproducir_plugin = function(){
    alert('entre a la funcion');
    //cordova.exec(function(winParam) {}, function(error) {}, "service","action", ["firstArgument", "secondArgument", 42,false]);
    alert('hizo el cordova exec');
    window.echo("echome", function(echoValue) {
        alert(echoValue == "echome"); // should alert true.
    });


  };

})

.controller('FavoritosCtrl', function ($scope, $state, $localstorage, $http, $sce) {

  var id_face = $localstorage.getObject('user').id;
  var serverIp = window.localStorage.getItem('serverIp');
  //var id_face = '10154179806703835';

    $http.get(serverIp +'users/favourites/'+id_face).
    then(function(data) {
      // this callback will be called asynchronously
      // when the response is available
      $scope.lista_favoritos = data.data;
      var len = $scope.lista_favoritos.length;

      var j = 0;

      $scope.favoritos = [];

      for(var i=0;i<len;i++)
      { 
        
        var idvideo = $scope.lista_favoritos[i].video_id; 
        $http.get(serverIp +'videos/'+ idvideo).success(function(data) {
        $scope.favoritos[j] = data;   
        var src = $scope.favoritos[j].url;

        $scope.favoritos[j].url= $sce.trustAsHtml('<iframe width="250px" height="150px" src="'+src+'" frameborder="0" allowfullscreen></iframe>');
        j++;
        if(j == len){
          console.log($scope.favoritos);
        }
        });

      }

    }, function(response) {
          $ionicPopup.alert({
            content: 'No se encontraron favoritos de este usuario.'
          }).then(function(res) {
            console.log('error en el alert');
          });
      $state.go('app.home');
    });

    $scope.doRefresh = function() {
      $http.get(serverIp +'users/favourites/'+id_face)
       .then(function(data) {
          $scope.lista_favoritos = data.data;
          var len = $scope.lista_favoritos.length;
          var j = 0;
          $scope.favoritos = [];
          for(var i=0;i<len;i++){ 
            var idvideo = $scope.lista_favoritos[i].video_id; 
            $http.get(serverIp +'videos/'+ idvideo).success(function(data) {
            $scope.favoritos[j] = data;   
            var src = $scope.favoritos[j].url;
            $scope.favoritos[j].url= $sce.trustAsHtml('<iframe width="250px" height="150px" src="'+src+'" frameborder="0" allowfullscreen></iframe>');
            j++;
            });
          }

       })
       .finally(function() {
         // Stop the ion-refresher from spinning
         $scope.$broadcast('scroll.refreshComplete');
       });
    };

})


.controller('ProfileCtrl', function ($scope, $state, $localstorage, $ionicModal) {
  
  $scope.user = $localstorage.getObject('user');

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  $scope.fbLogout = function() {
  
    //delete local storage information
    $localstorage.deleteObject('user');
    //delete scope user
    $scope.user = null;
    //show login modal again
    // Form data for the login modal
    $scope.loginData = {};
 
    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modal = modal;
        //$state.go('app.home');
        $scope.modal.show();

    }) ;

  }
})