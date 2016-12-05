/*
 **  User Object pojo model for capturing user details
 */

"use strict";

angular.module('userModule')
    .factory('userModel', ['localStorageService', 'appConstants', '$log',
        function (localStorageService, appConstants, $log) {

            // Only for demo instance.
            var _init = {
                userName: '',
                certification: '',
                consortium: {
                    id: '',
                    name: ''
                },
                userProfile: {
                    id: '',
                    profile: ''
                },
                isAuthenticatedUser: false,
                accountToken: ''

            };

            var _user = {};

            //Reset user object on logout
            var _reset = function () {
                try {
                    this._user = angular.copy(_init);
                    localStorageService.remove('User');
                } catch (e) {
                    $log.error(appConstants.FUNCTIONAL_ERR, e);
                }
                return this._user;
            };
            //Set user object
            var _setUserDetails = function (obj) {
                try {
                    this._user = obj;
                    localStorageService.set('User', angular.toJson(this._user));
                } catch (e) {
                    $log.error(appConstants.FUNCTIONAL_ERR, e);
                }
            };
            //Get user object
            var _getUserDetails = function () {
                try {
                    this._user = angular.fromJson(localStorageService.get('User')) || angular.copy(_init);
                } catch (e) {
                    $log.error(appConstants.FUNCTIONAL_ERR, e);
                }
                return this._user;
            };

            //Verify user logged in or not
            var _isUserLoggedIn = function () {
                return this._user.isAuthenticatedUser;
            };

            //Utility methods to check user role
            var _isAdmin = function () {
                return (this._user.isAuthenticatedUser && this._user.userProfile.id === appConstants.USER_ROLES.admin ? true : false);
            };
            var _isProducer = function () {
                return (this._user.isAuthenticatedUser && this._user.userProfile.id === appConstants.USER_ROLES.producer ? true : false);
            };
            var _isManufacturer = function () {
                return (this._user.isAuthenticatedUser && this._user.userProfile.id === appConstants.USER_ROLES.manufacturer ? true : false);
            };
            var _isRetailer = function () {
                return (this._user.isAuthenticatedUser && this._user.userProfile.id === appConstants.USER_ROLES.retailer ? true : false);
            };

            //Method to retreive user profile object
            var _getUserProfile = function () {
                return this._user.userProfile;
            };

            return {
                'getUser': _getUserDetails,
                'setUser': _setUserDetails,
                'isLoggedIn': _isUserLoggedIn,
                'getUserProfile': _getUserProfile,
                'isAdmin': _isAdmin,
                'isProducer': _isProducer,
                'isManufacturer': _isManufacturer,
                'isRetailer': _isRetailer,
                'resetUser': _reset
            }
        }
    ]);