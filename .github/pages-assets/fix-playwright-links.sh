#!/bin/bash
# Fix Playwright Report Links for GitHub Pages
# Ensures all Playwright report resources (data/, trace/) are served as-is by GitHub Pages:
# .nojekyll markers in every report directory and readable file permissions.

set -euo pipefail

SITE_DIR="${1:-site}"

echo "================================================"
echo "🔧 Fixing Playwright Report Links for GitHub Pages"
echo "================================================"
echo "Site directory: ${SITE_DIR}"
echo ""

# Function to fix links in a single report directory
fix_report_links() {
    local report_dir="$1"
    local run_id="$2"

    echo "Processing report ${run_id}: ${report_dir}"

    if [ ! -d "${report_dir}" ]; then
        echo "⚠️  Warning: Report directory not found: ${report_dir}"
        return
    fi

    if [ ! -f "${report_dir}/index.html" ]; then
        echo "⚠️  Warning: index.html not found in ${report_dir}"
        return
    fi

    local file_count
    file_count=$(find "${report_dir}" -type f 2>/dev/null | wc -l || echo 0)
    echo "  📁 Files in report: ${file_count}"

    for sub_dir in trace data; do
        if [ -d "${report_dir}/${sub_dir}" ]; then
            local sub_count
            sub_count=$(find "${report_dir}/${sub_dir}" -type f 2>/dev/null | wc -l || echo 0)
            echo "  ✓ ${sub_dir}/ directory found with ${sub_count} files"

            if [ "${sub_dir}" = "data" ]; then
                local zip_count
                zip_count=$(find "${report_dir}/data" -name "*.zip" 2>/dev/null | wc -l || echo 0)
                if [ "${zip_count}" -gt 0 ]; then
                    echo "    ✓ Found ${zip_count} trace .zip file(s)"
                else
                    echo "    ℹ️  No trace .zip files in data/ (no traces recorded for this run)"
                fi
            fi

            # Ensure .nojekyll in the directory and all subdirectories
            touch "${report_dir}/${sub_dir}/.nojekyll"
            find "${report_dir}/${sub_dir}" -type d -exec touch {}/.nojekyll \; 2>/dev/null || true

            # Make all files readable
            find "${report_dir}/${sub_dir}" -type f -exec chmod 644 {} \; 2>/dev/null || true
            find "${report_dir}/${sub_dir}" -type d -exec chmod 755 {} \; 2>/dev/null || true
            echo "    ✓ Permissions and .nojekyll set for ${sub_dir}/"
        else
            echo "  ℹ️  ${sub_dir}/ directory not found"
        fi
    done

    # Prevent Jekyll processing of the report root
    touch "${report_dir}/.nojekyll"

    echo "  ✅ Report processing complete"
    echo ""
}

# Ensure .nojekyll at site root
echo "📝 Creating .nojekyll at site root to disable Jekyll processing..."
touch "${SITE_DIR}/.nojekyll"

echo "📊 Processing reports..."
if [ -d "${SITE_DIR}/reports" ]; then
    report_count=0
    for report_dir in "${SITE_DIR}/reports"/*-*; do
        if [ -d "${report_dir}" ]; then
            run_id=$(basename "${report_dir}")
            fix_report_links "${report_dir}" "${run_id}"
            report_count=$((report_count + 1))
        fi
    done
    echo "  Processed ${report_count} report(s)"
else
    echo "⚠️  No reports found in ${SITE_DIR}/reports"
fi

echo ""
echo "================================================"
echo "✅ Playwright Report Link Fixing Complete"
echo "================================================"

# Final verification
echo ""
echo "📊 Final Site Structure Summary:"
total_files=$(find "${SITE_DIR}" -type f 2>/dev/null | wc -l || echo 0)
html_files=$(find "${SITE_DIR}" -name "*.html" 2>/dev/null | wc -l || echo 0)
trace_files=$(find "${SITE_DIR}" -path "*/trace/*" -type f 2>/dev/null | wc -l || echo 0)
data_files=$(find "${SITE_DIR}" -path "*/data/*" -type f 2>/dev/null | wc -l || echo 0)
zip_files=$(find "${SITE_DIR}" -name "*.zip" 2>/dev/null | wc -l || echo 0)
nojekyll_files=$(find "${SITE_DIR}" -name ".nojekyll" 2>/dev/null | wc -l || echo 0)

echo "  Total files: ${total_files}"
echo "  HTML files: ${html_files}"
echo "  Trace files: ${trace_files}"
echo "  Data files: ${data_files}"
echo "  ZIP files: ${zip_files}"
echo "  .nojekyll markers: ${nojekyll_files}"
echo ""

echo "📂 Sample Directory Structure:"
find "${SITE_DIR}" -type d 2>/dev/null | head -20 | sed 's/^/  /' || echo "  Unable to list directories"
echo ""
