$disp = Get-PnpDevice -Class 'WPD', 'AndroidDevice', 'MobileDevice' -ErrorAction SilentlyContinue | Select-Object FriendlyName, Present, InstanceId

if (-not $disp) {
    $disp = Get-PnpDevice | Where-Object { 
        $_.InstanceId -like '*VID_2717*' -or 
        $_.InstanceId -like '*VID_04E8*' -or 
        $_.InstanceId -like '*VID_22B8*' -or 
        $_.InstanceId -like '*VID_05AC*' -or
        $_.Class -eq 'WPD'
    } | Select-Object FriendlyName, Present, InstanceId
}

$disp | ConvertTo-Json -Compress
