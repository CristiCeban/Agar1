package Server;

public class Ball {
    private float x;
    private float y;
    private float r;
    private boolean isEaten;

    public Ball(float x, float y, float r) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.isEaten = false;
    }
    public Ball(float x, float y, float r,boolean isEaten) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.isEaten = isEaten;
    }

    public float getX() {
        return x;
    }

    public void setX(float x) {
        this.x = x;
    }

    public float getY() {
        return y;
    }

    public void setY(float y) {
        this.y = y;
    }

    public float getR() {
        return r;
    }

    public void setR(float r) {
        this.r = r;
    }

    public boolean isEaten() {
        return isEaten;
    }

    public void setEaten(boolean eaten) {
        isEaten = eaten;
    }
}
