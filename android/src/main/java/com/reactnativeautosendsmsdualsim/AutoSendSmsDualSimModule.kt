package com.reactnativeautosendsmsdualsim

import android.Manifest
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.telephony.SmsManager
import android.telephony.SubscriptionInfo
import android.telephony.SubscriptionManager
import androidx.annotation.RequiresApi
import androidx.core.app.ActivityCompat
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod



class AutoSendSmsDualSimModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "AutoSendSmsDualSim"
    }

    private val SENT = "SMS+SENT"
    private val DELIVERED = "SMS_DELIVERED"
    var isSimChooserNeeded: Boolean = false
    lateinit var subscriptionManager: SubscriptionManager
    private lateinit var subscriptionInfoList: List<SubscriptionInfo>
    private var sentPI: PendingIntent = PendingIntent.getBroadcast(reactContext, 0, Intent(SENT), 0)
    private var deliveredPI: PendingIntent = PendingIntent.getBroadcast(reactContext, 0, Intent(DELIVERED), 0)

    @ReactMethod
    @RequiresApi(Build.VERSION_CODES.LOLLIPOP_MR1)
    fun sendSmsFromSubscriptionIndex(simIndex: Int, destAddress: String, msgBody: String){
        val subscriptionID = subscriptionInfoList[simIndex].subscriptionId
        sendSMS(destAddress, msgBody, SmsManager.getSmsManagerForSubscriptionId(subscriptionID))
    }

    @ReactMethod
    fun sendSmsFromDefault(destAddress: String, msgBody: String){
        val smsManager = SmsManager.getDefault();
        sendSMS(destAddress, msgBody, smsManager)
    }

    private fun sendSMS(destAddress: String, msgBody: String, smsManager: SmsManager){
        smsManager.sendTextMessage(destAddress, null, msgBody, sentPI, deliveredPI)
    }

    @ReactMethod
    fun prepareSendSMS(){
        isSimChooserNeeded = false
        if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP_MR1){
            if (ActivityCompat.checkSelfPermission(reactContext, Manifest.permission.READ_PHONE_STATE) != PackageManager.PERMISSION_GRANTED) {
                return
            }
            subscriptionManager = reactContext.getSystemService(Context.TELEPHONY_SUBSCRIPTION_SERVICE) as SubscriptionManager
            subscriptionInfoList = subscriptionManager.activeSubscriptionInfoList
            if(subscriptionInfoList != null && subscriptionInfoList.size > 1){
                isSimChooserNeeded = true

            }
        }
    }

}
