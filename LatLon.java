
import java.lang.Math;
import java.util.List;
import java.util.ArrayList;

public class LatLon {

   public static void main(String[] args) {

    String latString = "25.769857210"; // if this format is not given then convert into this format
    String lonString = "82.67096950"; // if this format is not given then convert into this format
    String distanceString = "100000"; // in meters
    double EARTH_RADIUS = 111320; // meters
    // double EARTH_RADIUS = 6371000; // meters
    int numPoints = 10;
    List<double[]> coordinates = new ArrayList<>();
    List<String> points = new ArrayList<String>();

    double lat = Double.parseDouble(latString);
    double lon = Double.parseDouble(lonString);
    double distance = Double.parseDouble(distanceString);

    // converting values to radians
    double latRad = Math.toRadians(lat);

    // generating lat and lon offset
    double latOffset = distance / EARTH_RADIUS;
    double lonOffset = distance / (EARTH_RADIUS * Math.cos(latRad));

    for (int i = 0; i < numPoints; i++) {
      double angle = 360.0 / numPoints * i;
      double angleRad = Math.toRadians(angle);

      // Calculate new latitude and longitude
      double newLat = lat + latOffset * Math.cos(angleRad);
      double newLon = lon + lonOffset * Math.sin(angleRad);

      coordinates.add(new double[] { newLat, newLon });
      points.add(String.join(" ", new String[] { Double.toString(newLat), Double.toString(newLon) }));
    }

    System.err.println("POLYGON((" + String.join(",", points) + "," + points.get(0) + "))");

    // Print the calculated coordinates
    // for (int i = 0; i < coordinates.size(); i++) {
    // double[] point = coordinates.get(i);
    // System.out.printf("Point %d: Latitude = %.6f, Longitude = %.6f%n", i + 1,
    // point[0], point[1]);
    // }

    /*
     * SELECT * <table_name> where ST_Intersects(geom, "POLYGON((" +
     * String.join(",", points) + "))");
     * 
     * 
     * select t.name, t.latitude, t.longitude from (
     * select CONCAT('POINT(',latitude, '
     * ',longitude,')') as latlon, * from
     * table_name
     * ) t where
     * ST_Intersects(t.latlon::geometry, 'POLYGON(())'::geometry);
     * 
     * 
     */
  }
}
