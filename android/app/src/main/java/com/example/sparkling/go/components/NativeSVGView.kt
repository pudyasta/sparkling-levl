package com.example.sparkling.go.components

import android.content.Context
import android.util.Base64
import android.util.Log
import android.view.ViewGroup
import android.widget.ImageView
import com.caverock.androidsvg.SVG
import com.caverock.androidsvg.SVGImageView
import com.caverock.androidsvg.SVGParseException
import com.lynx.tasm.behavior.LynxContext
import com.lynx.tasm.behavior.LynxProp
import com.lynx.tasm.behavior.ui.LynxUI
import coil.load
import coil.decode.SvgDecoder
import java.nio.charset.StandardCharsets



class NativeSvgView(context: LynxContext) : LynxUI<SVGImageView>(context) {
    override fun createView(context: Context): SVGImageView {
        return SVGImageView(context).apply {
            // FIT_CENTER ensures the SVG maintains aspect ratio within the box
            scaleType = ImageView.ScaleType.FIT_CENTER

            // Ensure the view takes up the space allocated by Lynx
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
        }
    }

    @LynxProp(name = "src")
    fun setSrc(src: String?) {
        if (src.isNullOrEmpty()) return

        try {
            val svg: SVG = when {
                // 1. Handle Base64 Data URI
                src.startsWith("data:image/svg+xml;base64,") -> {
                    val base64Content = src.substringAfter("base64,")
                    val decodedBytes = Base64.decode(base64Content, Base64.DEFAULT)
                    val xmlString = String(decodedBytes, StandardCharsets.UTF_8)
                    SVG.getFromString(xmlString)
                }

                // 2. Handle Raw SVG XML
                src.startsWith("<svg") || src.startsWith("<?xml") -> {
                    SVG.getFromString(src)
                }

                // 3. Handle Remote URL (Assuming you kept the Coil implementation)
                src.startsWith("http") -> {
                    // If using Coil, let it handle the URL
                    mView.load(src) {
                        decoderFactory { result, options, _ -> SvgDecoder(result.source, options) }
                    }
                    return
                }

                else -> return
            }

            // Render the parsed SVG object
            mView.setSVG(svg)

        } catch (e: Exception) {
            Log.e("LynxSVG", "Failed to process SVG: ${e.message}")
        }
    }

    // This informs Lynx how to measure the view if CSS width/height are 'auto'
    override fun onLayoutUpdated() {
        super.onLayoutUpdated()
        // If you need to do something specific when size changes, do it here
    }
}
