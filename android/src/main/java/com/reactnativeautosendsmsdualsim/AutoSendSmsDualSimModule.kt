package com.reactnativeautosendsmsdualsim

import android.Manifest
import android.app.Activity
import android.app.PendingIntent
import android.content.*
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.telephony.SmsManager
import android.telephony.SubscriptionInfo
import android.telephony.SubscriptionManager
import android.util.Log
import androidx.annotation.RequiresApi
import androidx.core.app.ActivityCompat
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter
import org.json.JSONObject
import java.util.*
import kotlin.collections.ArrayList


class AutoSendSmsDualSimModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "AutoSendSmsDualSim"
    }

    private val SENT = "SMS+SENT"
    private val DELIVERED = "SMS_DELIVERED"

    @get:[ReactMethod JvmName("isSimChooserNeeded")]
    var isSimChooserNeeded: Boolean = false
    lateinit var subscriptionManager: SubscriptionManager
    private lateinit var subscriptionInfoList: List<SubscriptionInfo>
    private var sentPI: PendingIntent = PendingIntent.getBroadcast(reactContext, 0, Intent(SENT), 0)
    private var deliveredPI: PendingIntent = PendingIntent.getBroadcast(reactContext, 0, Intent(DELIVERED), 0)
    private var mSuccessCb: Callback? = null
    private var mErrorCb: Callback? = null
    private var TAG = "DEBUG_CHECK"

    @ReactMethod
    @RequiresApi(Build.VERSION_CODES.LOLLIPOP_MR1)
    fun sendSmsFromSlotIndex(simIndex: Int?, destAddress: String, msgBody: String, successCb: Callback, errorCb: Callback){
        var smsManager = SmsManager.getDefault();
        if( simIndex != null &&  (simIndex == 1 || simIndex == 2)){
            smsManager = SmsManager.getSmsManagerForSubscriptionId(subscriptionInfoList[simIndex -1].subscriptionId)
        }
        sendSMS(destAddress, msgBody, smsManager, successCb, errorCb);
    }

    @RequiresApi(Build.VERSION_CODES.LOLLIPOP_MR1)
    @ReactMethod
    fun getActivePhoneNumberList(callback: Callback){
        val json = JSONObject()
        subscriptionInfoList.forEachIndexed() { index, element ->
            json.put("SIM_$index", element.number)
        }
        callback.invoke(json.toString())
    }

    private fun sendCallback(errorMsg: String, status: Boolean){
        if(status){
            mSuccessCb?.invoke(errorMsg)
        }else{
            mErrorCb?.invoke(errorMsg)
        }
    }

    private fun sendEvent(reactContext: ReactContext, eventName: String, params: String) {
        reactContext.getJSModule(RCTDeviceEventEmitter::class.java).emit(eventName, params)
    }

    private fun sendSMS(destAddress: String, msgBody: String, smsManager: SmsManager, successCb: Callback, errorCb: Callback){
        mSuccessCb = successCb
        mErrorCb = errorCb

        val sentPendingIntents = ArrayList<PendingIntent>()
        val deliveredPendingIntents = ArrayList<PendingIntent>()

        reactContext.registerReceiver(object : BroadcastReceiver() {
            override fun onReceive(arg0: Context, arg1: Intent) {
                when (resultCode) {
                    Activity.RESULT_OK -> sendCallback("SMS sent", true)
                    SmsManager.RESULT_ERROR_GENERIC_FAILURE -> sendCallback("Generic failure", false)
                    SmsManager.RESULT_ERROR_NO_SERVICE -> sendCallback("No service", false)
                    SmsManager.RESULT_ERROR_NULL_PDU -> sendCallback("Null PDU", false)
                    SmsManager.RESULT_ERROR_RADIO_OFF -> sendCallback("Radio off", false)
                }
            }
        }, IntentFilter(SENT))

        //---when the SMS has been delivered---
        reactContext.registerReceiver(object : BroadcastReceiver() {
            override fun onReceive(arg0: Context, arg1: Intent) {
                when (resultCode) {
                    Activity.RESULT_OK -> sendEvent(reactContext, "sms_onDelivery", "SMS delivered")
                    Activity.RESULT_CANCELED -> sendEvent(reactContext, "sms_onDelivery", "SMS not delivered")
                }
            }
        }, IntentFilter(DELIVERED))
        val parts: ArrayList<String> = smsManager.divideMessage(msgBody)

        for (i in parts.indices) {
            sentPendingIntents.add(i, sentPI)
            deliveredPendingIntents.add(i, deliveredPI)
        }
        smsManager.sendMultipartTextMessage(destAddress, null, parts, sentPendingIntents, deliveredPendingIntents)


        val values = ContentValues()
        values.put("address", destAddress)
        values.put("body", msgBody)
        reactContext.contentResolver.insert(Uri.parse("content://sms/sent"), values)
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
