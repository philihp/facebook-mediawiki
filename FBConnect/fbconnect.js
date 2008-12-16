/*
 * Initializes the Facebook Connect JavaScript libraries.
 * Make sure that the variable api_key is set!
 */
function facebook_init() {
    FB_RequireFeatures(["XFBML"], function() {
        FB.init(api_key, "/w/extensions/FBConnect/xd_receiver.php");
    }
}

/*
 * Logs the user into Facebook. Upon login, the page is probably refreshed.
 */
function facebook_login(){
    FB_RequireFeatures(["Connect"], function() {
        FB.Connect.requireSession(function() {
            facebook_onlogin_ready();
        })
    });
}

/*
 * Logs the user out of Facebook. When this is accomplished, the user is redirected to
 * the Wiki's logout page to keep things syncronized.
 */
var ctime;
function facebook_logout() {
    ctime = setTimeout("alert('Timeout waiting for FB.Connect.logoutAndRedirect(). The error returned was: " +
                       "\\\"FB.UI is undefined\\\" (connect.js.pkg.php, line 502).\\n\\n" +
                       "We cannot log you out of Facebook at this time. Please visit Facebook.com and logout directly.');", 3000);
                       //"window.location = '" + logout_url + "';", 3000);
    FB_RequireFeatures(["Connect"], function() {
        clearTimeout(ctime);
        //logout_url = window.location.href;
        FB.Connect.logoutAndRedirect(logout_url);
    });
}

/*
 * Because the PersonalUrls hook only accepts plain text...
 */
function facebook_onload_addFBConnectButtons() {
    if (document.getElementById("pt-fbconnect")) {
        // Either use a FBXML button, or render an html button
        document.getElementById("pt-fbconnect").innerHTML = '<a href="#" onclick="facebook_login(); return false;">' +
            '<img id="fb_login_image" src="http://static.ak.fbcdn.net/images/fbconnect/login-buttons/connect_light_medium_long.gif" ' + 
            'alt="Connect with Facebook"/></a>';
        //document.getElementById("pt-fbconnect").innerHTML = '<fb:login-button length="long" onlogin="facebook_onlogin_ready();"></fb:login-button>';
    }
    if (document.getElementById("pt-fblogout")) {
        // Either use a FBXML button, render an html button, or a combination of both
        document.getElementById("pt-fblogout").innerHTML = '<a href="#" onclick="facebook_logout(); return false;">' + 
            '<img id="fb_logout_image" src="http://static.ak.fbcdn.net/images/fbconnect/logout-buttons/logout_small.gif" ' + 
            'alt="Logout of Facebook"/></a>';
        //document.getElementById("pt-fblogout").innerHTML = '<fb:login-button autologoutlink="true"></fb:login-button>';
        //document.getElementById("pt-fblogout").innerHTML = '<span onclick="setTimeout(\'facebook_logout_function()\', 2000)"><fb:login-button autologoutlink="true" size="small"></fb:login-button></span>';
    }
}

/*
 * Not used. This was provided as an example by the Facebook Dev Wiki. This function alerts the user
 * that the session is ready, and then displays a message box containing the user's friends' IDs.
 */
function facebook_alertfunction() {
    FB_RequireFeatures(["XFBML"], function()
    {
        facebook_init();
        FB.Facebook.get_sessionState().waitUntilReady(function()
        {
            window.alert("Session is ready");
            // If you want to make Facebook API calls from JavaScript do something like
            FB.Facebook.apiClient.friends_get(null, function(result, ex)
            {
                //Do something with result
                window.alert("Friends list: " + result);
            });
        });
    });
}



/*
 * The facebook_onload statement is printed out in the PHP. If the user's logged in
 * status has changed since the last page load, then refresh the page to pick up
 * the change.
 *
 * This helps enforce the concept of "single sign on", so that if a user is signed into
 * Facebook when they visit your site, they will be automatically logged in -
 * without any need to click the login button.
 *
 * @param already_logged_into_facebook  reports whether the server thinks the user
 *                                      is logged in, based on their cookies
 *
 */
function facebook_onload() {
  // user state is either: has a session, or does not.
  // if the state has changed, detect that and reload.
  FB.ensureInit(function() {
      FB.Facebook.get_sessionState().waitUntilReady(function(session) {
          var is_now_logged_into_facebook = session ? true : false;

          // if the new state is the same as the old (i.e., nothing changed) then do nothing
          if (is_now_logged_into_facebook == already_logged_into_facebook) {
            return;
          }

          // otherwise, refresh to pick up the state change
          refresh_page();
        });
    });
}

/*
 * Our <fb:login-button> specifies this function in its onlogin attribute,
 * which is triggered after the user authenticates the app in the Connect
 * dialog and the Facebook session has been set in the cookies.
 */
function facebook_onlogin_ready() {
  // In this app, we redirect the user back to index.php. The server will read
  // the cookie and see that the user is logged in, and will deliver a new page
  // with content appropriate for a logged-in user.
  //
  // However, a more complex app could use this function to do AJAX calls
  // and/or in-place replacement of page contents to avoid a full page refresh.
  refresh_page();
}

/*
 * Do a page refresh after login state changes.
 * This is the easiest but not the only way to pick up changes.
 * If you have a small amount of Facebook-specific content on a large page,
 * then you could change it in Javascript without refresh.
 *
 * This function was modified from The Run Around's original function to not load index.php.
 */
function refresh_page() {
  window.location.reload(true);
}

/*
 * Prompts the user to grant a permission to the application.
 *
 * This function is not currently used in FBConnect.
 *
function facebook_prompt_permission(permission) {
  FB.ensureInit(function() {
    FB.Connect.showPermissionDialog(permission);
  });
}

/*
 * Show the feed form. This would be typically called in response to the
 * onclick handler of a "Publish" button, or in the onload event after
 * the user submits a form with info that should be published.
 *
 * This function is not currently used in FBConnect.
 *
function facebook_publish_feed_story(form_bundle_id, template_data) {
  // Load the feed form
  FB.ensureInit(function() {
          FB.Connect.showFeedDialog(form_bundle_id, template_data);
          //FB.Connect.showFeedDialog(form_bundle_id, template_data, null, null, FB.FeedStorySize.shortStory, FB.RequireConnect.promptConnect);

      // hide the "Loading feed story ..." div
      ge('feed_loading').style.visibility = "hidden";
  });
}

/*
 * If a user is not connected, then the checkbox that says "Publish To Facebook"
 * is hidden in the "add run" form.
 *
 * This function detects whether the user is logged into facebook but just
 * not connected, and shows the checkbox if that's true.
 *
 * This function is not currently used in FBConnect.
 *
function facebook_show_feed_checkbox() {
  FB.ensureInit(function() {
      FB.Connect.get_status().waitUntilReady(function(status) {
          if (status != FB.ConnectState.userNotLoggedIn) {
            // If the user is currently logged into Facebook, but has not
            // authorized the app, then go ahead and show them the feed dialog + upsell
            checkbox = ge('publish_fb_checkbox');
            if (checkbox) {
              checkbox.style.visibility = "visible";
            }
          }
        });
    });
}
/**/